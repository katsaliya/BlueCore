import fs from "fs";
import os from "os";
import path from "path";
import multer from "multer";
import { Router } from "express";
import { z } from "zod";
import {
  appendSqliteMessageWithId,
  createSqliteSession,
  getSqliteSession,
  listUserSessions,
  userOwnsSession
} from "../store/sqliteSessionStore";
import {
  queryVectorAiBridge,
  upsertVectorAiBridge
} from "../services/vectoraiBridge";
import {
  synthesizeSpeech,
  transcribeAudioFile
} from "../services/voiceBridge";
import { LocalLlmStubProvider } from "../providers/llm/LocalLlmStubProvider";
import { requireAuth } from "../middleware/requireAuth";
import { AuthenticatedRequest } from "../types/auth";
import { saveAudioBuffer } from "../store/audioStore";

const router = Router();
const upload = multer({ dest: path.join(os.tmpdir(), "greenwatch-uploads") });
const llmProvider = new LocalLlmStubProvider();

const historyQuerySchema = z.object({
  sessionId: z.string().min(1)
});

const messageSchema = z.object({
  sessionId: z.string().min(1),
  text: z.string().min(1)
});

function extensionFromFilename(filename?: string | null, fallback = ".bin") {
  if (!filename) return fallback;
  const ext = path.extname(filename);
  return ext || fallback;
}

function extensionFromMimeType(mimeType?: string | null) {
  switch (mimeType) {
    case "audio/wav":
    case "audio/x-wav":
      return ".wav";
    case "audio/mpeg":
      return ".mp3";
    case "audio/mp4":
    case "audio/x-m4a":
      return ".m4a";
    case "audio/ogg":
      return ".ogg";
    case "audio/webm":
      return ".webm";
    default:
      return ".bin";
  }
}

async function handleSessionTextMessage(
  userId: number,
  sessionId: string,
  text: string
) {
  const session = getSqliteSession(sessionId);

  if (!session || !userOwnsSession(userId, sessionId)) {
    return {
      status: 404,
      body: {
        ok: false,
        message: "Session not found"
      }
    };
  }

  const userTimestamp = new Date().toISOString();

  const userInsert = appendSqliteMessageWithId(sessionId, {
    role: "user",
    text,
    timestamp: userTimestamp
  });

  if (!userInsert) {
    return {
      status: 404,
      body: {
        ok: false,
        message: "Session not found"
      }
    };
  }

  try {
    await upsertVectorAiBridge({
      namespace: sessionId,
      records: [
        {
          id: `user-${Date.now()}`,
          text,
          metadata: {
            userId,
            messageId: userInsert.messageId,
            role: "user",
            timestamp: userTimestamp
          }
        }
      ]
    });
  } catch (error) {
    return {
      status: 502,
      body: {
        ok: false,
        message:
          error instanceof Error
            ? `Failed to store message in VectorAI bridge (${error.message})`
            : "Failed to store message in VectorAI bridge"
      }
    };
  }

  let retrievedMatches: unknown[] = [];

  try {
    const queryResult = await queryVectorAiBridge({
      namespace: sessionId,
      text,
      topK: 3
    });

    const data = queryResult.data as { matches?: unknown[] };
    retrievedMatches = data.matches ?? [];
  } catch (error) {
    return {
      status: 502,
      body: {
        ok: false,
        message:
          error instanceof Error
            ? `Failed to query VectorAI bridge (${error.message})`
            : "Failed to query VectorAI bridge"
      }
    };
  }

  let assistantText: string;

  try {
    assistantText = await llmProvider.generateReply({
      sessionId,
      userText: text,
      retrievedMatches
    });
  } catch (error) {
    return {
      status: 502,
      body: {
        ok: false,
        message:
          error instanceof Error
            ? `Failed to generate assistant reply (${error.message})`
            : "Failed to generate assistant reply"
      }
    };
  }

  const assistantTimestamp = new Date().toISOString();

  const assistantInsert = appendSqliteMessageWithId(sessionId, {
    role: "assistant",
    text: assistantText,
    timestamp: assistantTimestamp
  });

  return {
    status: 200,
    body: {
      ok: true,
      sessionId,
      reply: assistantText,
      retrievedMatches,
      historyLength: assistantInsert?.session?.history.length ?? 0,      
      userMessageId: userInsert.messageId,
      assistantMessageId: assistantInsert?.messageId ?? null
    }
  };
}

router.get("/sessions", requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.authUser!.id;
  const sessions = listUserSessions(userId);

  return res.status(200).json({
    ok: true,
    sessions
  });
});

router.post("/session/start", requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.authUser!.id;
  const session = createSqliteSession(userId);

  return res.status(200).json({
    ok: true,
    sessionId: session.sessionId,
    createdAt: session.createdAt,
    userId: session.userId
  });
});

router.get("/session/history", requireAuth, (req: AuthenticatedRequest, res) => {
  const parsed = historyQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: "Missing or invalid sessionId"
    });
  }

  const userId = req.authUser!.id;
  const session = getSqliteSession(parsed.data.sessionId);

  if (!session || !userOwnsSession(userId, parsed.data.sessionId)) {
    return res.status(404).json({
      ok: false,
      message: "Session not found"
    });
  }

  return res.status(200).json({
    ok: true,
    sessionId: session.sessionId,
    createdAt: session.createdAt,
    history: session.history
  });
});

router.post("/session/message", requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = messageSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: "Invalid session message request",
      issues: parsed.error.issues
    });
  }

  const userId = req.authUser!.id;

  const result = await handleSessionTextMessage(
    userId,
    parsed.data.sessionId,
    parsed.data.text
  );

  return res.status(result.status).json(result.body);
});

router.post(
  "/session/message/audio",
  requireAuth,
  upload.single("file"),
  async (req: AuthenticatedRequest, res) => {
    const sessionId = String(req.body.sessionId || "");
    const file = req.file;
    const userId = req.authUser!.id;

    if (!sessionId) {
      return res.status(400).json({
        ok: false,
        message: "Missing sessionId"
      });
    }

    if (!file) {
      return res.status(400).json({
        ok: false,
        message: "Missing audio file"
      });
    }

    try {
      const inputBuffer = fs.readFileSync(file.path);

      const transcription = await transcribeAudioFile(
        file.path,
        file.originalname,
        file.mimetype
      );

      const result = await handleSessionTextMessage(userId, sessionId, transcription.text);

      if (result.status !== 200 || !result.body.ok) {
        return res.status(result.status).json({
          ...result.body,
          transcript: transcription.text,
          transcriptLanguage: transcription.language,
          transcriptDuration: transcription.duration
        });
      }

      saveAudioBuffer({
        sessionId,
        userId,
        role: "user",
        kind: "input",
        mimeType: file.mimetype,
        originalFilename: file.originalname,
        durationSeconds: transcription.duration ?? null,
        buffer: inputBuffer,
        extension:
          extensionFromFilename(file.originalname, extensionFromMimeType(file.mimetype)),
        messageId:
          "userMessageId" in result.body ? Number(result.body.userMessageId) : null
      });

      return res.status(result.status).json({
        ...result.body,
        transcript: transcription.text,
        transcriptLanguage: transcription.language,
        transcriptDuration: transcription.duration
      });
    } catch (error) {
      return res.status(502).json({
        ok: false,
        message:
          error instanceof Error
            ? `Failed to transcribe audio (${error.message})`
            : "Failed to transcribe audio"
      });
    } finally {
      try {
        fs.unlinkSync(file.path);
      } catch {
      }
    }
  }
);

router.post(
  "/session/message/audio/reply-audio",
  requireAuth,
  upload.single("file"),
  async (req: AuthenticatedRequest, res) => {
    const sessionId = String(req.body.sessionId || "");
    const file = req.file;
    const userId = req.authUser!.id;

    if (!sessionId) {
      return res.status(400).json({
        ok: false,
        message: "Missing sessionId"
      });
    }

    if (!file) {
      return res.status(400).json({
        ok: false,
        message: "Missing audio file"
      });
    }

    try {
      const inputBuffer = fs.readFileSync(file.path);

      const transcription = await transcribeAudioFile(
        file.path,
        file.originalname,
        file.mimetype
      );

      const result = await handleSessionTextMessage(userId, sessionId, transcription.text);

      if (!result.body.ok || !("reply" in result.body)) {
        return res.status(result.status).json({
          ...result.body,
          transcript: transcription.text,
          transcriptLanguage: transcription.language,
          transcriptDuration: transcription.duration
        });
      }

      const userMessageId =
        "userMessageId" in result.body ? Number(result.body.userMessageId) : null;
      const assistantMessageId =
        "assistantMessageId" in result.body
          ? Number(result.body.assistantMessageId)
          : null;

      saveAudioBuffer({
        sessionId,
        userId,
        role: "user",
        kind: "input",
        mimeType: file.mimetype,
        originalFilename: file.originalname,
        durationSeconds: transcription.duration ?? null,
        buffer: inputBuffer,
        extension:
          extensionFromFilename(file.originalname, extensionFromMimeType(file.mimetype)),
        messageId: userMessageId
      });

      const replyText = String(result.body.reply || "");
      const wavBuffer = await synthesizeSpeech(replyText);

      saveAudioBuffer({
        sessionId,
        userId,
        role: "assistant",
        kind: "reply",
        mimeType: "audio/wav",
        originalFilename: "greenwatch-reply.wav",
        durationSeconds: null,
        buffer: wavBuffer,
        extension: ".wav",
        messageId: assistantMessageId
      });

      res.setHeader("Content-Type", "audio/wav");
      res.setHeader("X-GreenWatch-Transcript", encodeURIComponent(transcription.text));
      res.setHeader("X-GreenWatch-Reply", encodeURIComponent(replyText));
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="greenwatch-reply.wav"'
      );

      return res.status(200).send(wavBuffer);
    } catch (error) {
      return res.status(502).json({
        ok: false,
        message:
          error instanceof Error
            ? `Failed to process audio reply (${error.message})`
            : "Failed to process audio reply"
      });
    } finally {
      try {
        fs.unlinkSync(file.path);
      } catch {
      }
    }
  }
);

export default router;