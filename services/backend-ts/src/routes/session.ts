import fs from "fs";
import os from "os";
import path from "path";
import multer from "multer";
import { Router } from "express";
import { z } from "zod";
import {
  appendMessage,
  createSession,
  getSession
} from "../store/sessionStore";
import {
  queryVectorAiBridge,
  upsertVectorAiBridge
} from "../services/vectoraiBridge";
import {
  synthesizeSpeech,
  transcribeAudioFile
} from "../services/voiceBridge";
import { LocalLlmStubProvider } from "../providers/llm/LocalLlmStubProvider";

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

async function handleSessionTextMessage(sessionId: string, text: string) {
  const session = getSession(sessionId);

  if (!session) {
    return {
      status: 404,
      body: {
        ok: false,
        message: "Session not found"
      }
    };
  }

  const userTimestamp = new Date().toISOString();

  appendMessage(sessionId, {
    role: "user",
    text,
    timestamp: userTimestamp
  });

  try {
    await upsertVectorAiBridge({
      namespace: sessionId,
      records: [
        {
          id: `user-${Date.now()}`,
          text,
          metadata: {
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

  const updatedSession = appendMessage(sessionId, {
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
      historyLength: updatedSession?.history.length ?? 0
    }
  };
}

router.post("/session/start", (_req, res) => {
  const session = createSession();

  return res.status(200).json({
    ok: true,
    sessionId: session.sessionId,
    createdAt: session.createdAt
  });
});

router.get("/session/history", (req, res) => {
  const parsed = historyQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: "Missing or invalid sessionId"
    });
  }

  const session = getSession(parsed.data.sessionId);

  if (!session) {
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

router.post("/session/message", async (req, res) => {
  const parsed = messageSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: "Invalid session message request",
      issues: parsed.error.issues
    });
  }

  const result = await handleSessionTextMessage(
    parsed.data.sessionId,
    parsed.data.text
  );

  return res.status(result.status).json(result.body);
});

router.post(
  "/session/message/audio",
  upload.single("file"),
  async (req, res) => {
    const sessionId = String(req.body.sessionId || "");
    const file = req.file;

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
      const transcription = await transcribeAudioFile(
        file.path,
        file.originalname,
        file.mimetype
      );

      const result = await handleSessionTextMessage(sessionId, transcription.text);

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
        // ignore cleanup failure
      }
    }
  }
);

router.post(
  "/session/message/audio/reply-audio",
  upload.single("file"),
  async (req, res) => {
    const sessionId = String(req.body.sessionId || "");
    const file = req.file;

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
      const transcription = await transcribeAudioFile(
        file.path,
        file.originalname,
        file.mimetype
      );

      const result = await handleSessionTextMessage(sessionId, transcription.text);

      if (!result.body.ok || !("reply" in result.body)) {
        return res.status(result.status).json({
          ...result.body,
          transcript: transcription.text,
          transcriptLanguage: transcription.language,
          transcriptDuration: transcription.duration
        });
      }

      const replyText = String(result.body.reply || "");
      const wavBuffer = await synthesizeSpeech(replyText);

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
        // ignore cleanup failure
      }
    }
  }
);

export default router;