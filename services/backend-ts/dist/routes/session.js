"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const express_1 = require("express");
const zod_1 = require("zod");
const sqliteSessionStore_1 = require("../store/sqliteSessionStore");
const vectoraiBridge_1 = require("../services/vectoraiBridge");
const voiceBridge_1 = require("../services/voiceBridge");
const LocalLlmStubProvider_1 = require("../providers/llm/LocalLlmStubProvider");
const requireAuth_1 = require("../middleware/requireAuth");
const audioStore_1 = require("../store/audioStore");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: path_1.default.join(os_1.default.tmpdir(), "greenwatch-uploads") });
const llmProvider = new LocalLlmStubProvider_1.LocalLlmStubProvider();
const historyQuerySchema = zod_1.z.object({
    sessionId: zod_1.z.string().min(1)
});
const messageSchema = zod_1.z.object({
    sessionId: zod_1.z.string().min(1),
    text: zod_1.z.string().min(1)
});
function extensionFromFilename(filename, fallback = ".bin") {
    if (!filename)
        return fallback;
    const ext = path_1.default.extname(filename);
    return ext || fallback;
}
function extensionFromMimeType(mimeType) {
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
async function handleSessionTextMessage(userId, sessionId, text) {
    const session = (0, sqliteSessionStore_1.getSqliteSession)(sessionId);
    if (!session || !(0, sqliteSessionStore_1.userOwnsSession)(userId, sessionId)) {
        return {
            status: 404,
            body: {
                ok: false,
                message: "Session not found"
            }
        };
    }
    const userTimestamp = new Date().toISOString();
    const userInsert = (0, sqliteSessionStore_1.appendSqliteMessageWithId)(sessionId, {
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
        await (0, vectoraiBridge_1.upsertVectorAiBridge)({
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
    }
    catch (error) {
        return {
            status: 502,
            body: {
                ok: false,
                message: error instanceof Error
                    ? `Failed to store message in VectorAI bridge (${error.message})`
                    : "Failed to store message in VectorAI bridge"
            }
        };
    }
    let retrievedMatches = [];
    try {
        const queryResult = await (0, vectoraiBridge_1.queryVectorAiBridge)({
            namespace: sessionId,
            text,
            topK: 3
        });
        const data = queryResult.data;
        retrievedMatches = data.matches ?? [];
    }
    catch (error) {
        return {
            status: 502,
            body: {
                ok: false,
                message: error instanceof Error
                    ? `Failed to query VectorAI bridge (${error.message})`
                    : "Failed to query VectorAI bridge"
            }
        };
    }
    let assistantText;
    try {
        assistantText = await llmProvider.generateReply({
            sessionId,
            userText: text,
            retrievedMatches
        });
    }
    catch (error) {
        return {
            status: 502,
            body: {
                ok: false,
                message: error instanceof Error
                    ? `Failed to generate assistant reply (${error.message})`
                    : "Failed to generate assistant reply"
            }
        };
    }
    const assistantTimestamp = new Date().toISOString();
    const assistantInsert = (0, sqliteSessionStore_1.appendSqliteMessageWithId)(sessionId, {
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
router.get("/sessions", requireAuth_1.requireAuth, (req, res) => {
    const userId = req.authUser.id;
    const sessions = (0, sqliteSessionStore_1.listUserSessions)(userId);
    return res.status(200).json({
        ok: true,
        sessions
    });
});
router.post("/session/start", requireAuth_1.requireAuth, (req, res) => {
    const userId = req.authUser.id;
    const session = (0, sqliteSessionStore_1.createSqliteSession)(userId);
    return res.status(200).json({
        ok: true,
        sessionId: session.sessionId,
        createdAt: session.createdAt,
        userId: session.userId
    });
});
router.get("/session/history", requireAuth_1.requireAuth, (req, res) => {
    const parsed = historyQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({
            ok: false,
            message: "Missing or invalid sessionId"
        });
    }
    const userId = req.authUser.id;
    const session = (0, sqliteSessionStore_1.getSqliteSession)(parsed.data.sessionId);
    if (!session || !(0, sqliteSessionStore_1.userOwnsSession)(userId, parsed.data.sessionId)) {
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
router.post("/session/message", requireAuth_1.requireAuth, async (req, res) => {
    const parsed = messageSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            ok: false,
            message: "Invalid session message request",
            issues: parsed.error.issues
        });
    }
    const userId = req.authUser.id;
    const result = await handleSessionTextMessage(userId, parsed.data.sessionId, parsed.data.text);
    return res.status(result.status).json(result.body);
});
router.post("/session/message/audio", requireAuth_1.requireAuth, upload.single("file"), async (req, res) => {
    const sessionId = String(req.body.sessionId || "");
    const file = req.file;
    const userId = req.authUser.id;
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
        const inputBuffer = fs_1.default.readFileSync(file.path);
        const transcription = await (0, voiceBridge_1.transcribeAudioFile)(file.path, file.originalname, file.mimetype);
        const result = await handleSessionTextMessage(userId, sessionId, transcription.text);
        if (result.status !== 200 || !result.body.ok) {
            return res.status(result.status).json({
                ...result.body,
                transcript: transcription.text,
                transcriptLanguage: transcription.language,
                transcriptDuration: transcription.duration
            });
        }
        (0, audioStore_1.saveAudioBuffer)({
            sessionId,
            userId,
            role: "user",
            kind: "input",
            mimeType: file.mimetype,
            originalFilename: file.originalname,
            durationSeconds: transcription.duration ?? null,
            buffer: inputBuffer,
            extension: extensionFromFilename(file.originalname, extensionFromMimeType(file.mimetype)),
            messageId: "userMessageId" in result.body ? Number(result.body.userMessageId) : null
        });
        return res.status(result.status).json({
            ...result.body,
            transcript: transcription.text,
            transcriptLanguage: transcription.language,
            transcriptDuration: transcription.duration
        });
    }
    catch (error) {
        return res.status(502).json({
            ok: false,
            message: error instanceof Error
                ? `Failed to transcribe audio (${error.message})`
                : "Failed to transcribe audio"
        });
    }
    finally {
        try {
            fs_1.default.unlinkSync(file.path);
        }
        catch {
        }
    }
});
router.post("/session/message/audio/reply-audio", requireAuth_1.requireAuth, upload.single("file"), async (req, res) => {
    const sessionId = String(req.body.sessionId || "");
    const file = req.file;
    const userId = req.authUser.id;
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
        const inputBuffer = fs_1.default.readFileSync(file.path);
        const transcription = await (0, voiceBridge_1.transcribeAudioFile)(file.path, file.originalname, file.mimetype);
        const result = await handleSessionTextMessage(userId, sessionId, transcription.text);
        if (!result.body.ok || !("reply" in result.body)) {
            return res.status(result.status).json({
                ...result.body,
                transcript: transcription.text,
                transcriptLanguage: transcription.language,
                transcriptDuration: transcription.duration
            });
        }
        const userMessageId = "userMessageId" in result.body ? Number(result.body.userMessageId) : null;
        const assistantMessageId = "assistantMessageId" in result.body
            ? Number(result.body.assistantMessageId)
            : null;
        (0, audioStore_1.saveAudioBuffer)({
            sessionId,
            userId,
            role: "user",
            kind: "input",
            mimeType: file.mimetype,
            originalFilename: file.originalname,
            durationSeconds: transcription.duration ?? null,
            buffer: inputBuffer,
            extension: extensionFromFilename(file.originalname, extensionFromMimeType(file.mimetype)),
            messageId: userMessageId
        });
        const replyText = String(result.body.reply || "");
        const wavBuffer = await (0, voiceBridge_1.synthesizeSpeech)(replyText);
        (0, audioStore_1.saveAudioBuffer)({
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
        res.setHeader("Content-Disposition", 'attachment; filename="greenwatch-reply.wav"');
        return res.status(200).send(wavBuffer);
    }
    catch (error) {
        return res.status(502).json({
            ok: false,
            message: error instanceof Error
                ? `Failed to process audio reply (${error.message})`
                : "Failed to process audio reply"
        });
    }
    finally {
        try {
            fs_1.default.unlinkSync(file.path);
        }
        catch {
        }
    }
});
exports.default = router;
