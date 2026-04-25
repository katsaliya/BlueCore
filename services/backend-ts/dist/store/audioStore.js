"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveAudioBuffer = saveAudioBuffer;
exports.listAudioRecordsForSession = listAudioRecordsForSession;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sqlite_1 = require("../db/sqlite");
const audioRoot = path_1.default.resolve(process.cwd(), "data", "audio");
function ensureDir(dirPath) {
    if (!fs_1.default.existsSync(dirPath)) {
        fs_1.default.mkdirSync(dirPath, { recursive: true });
    }
}
ensureDir(audioRoot);
function saveAudioBuffer(params) {
    const createdAt = new Date().toISOString();
    const sessionDir = path_1.default.join(audioRoot, params.sessionId);
    ensureDir(sessionDir);
    const safeExt = params.extension.startsWith(".")
        ? params.extension
        : `.${params.extension}`;
    const filename = `${Date.now()}-${params.role}-${params.kind}${safeExt}`;
    const filePath = path_1.default.join(sessionDir, filename);
    fs_1.default.writeFileSync(filePath, params.buffer);
    const result = sqlite_1.db.prepare(`
    INSERT INTO audio_records (
      message_id,
      session_id,
      user_id,
      role,
      kind,
      mime_type,
      original_filename,
      file_path,
      duration_seconds,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(params.messageId ?? null, params.sessionId, params.userId ?? null, params.role, params.kind, params.mimeType ?? null, params.originalFilename ?? null, filePath, params.durationSeconds ?? null, createdAt);
    return {
        id: Number(result.lastInsertRowid),
        messageId: params.messageId ?? null,
        sessionId: params.sessionId,
        userId: params.userId ?? null,
        role: params.role,
        kind: params.kind,
        mimeType: params.mimeType ?? null,
        originalFilename: params.originalFilename ?? null,
        filePath,
        durationSeconds: params.durationSeconds ?? null,
        createdAt
    };
}
function listAudioRecordsForSession(sessionId) {
    return sqlite_1.db.prepare(`
    SELECT
      id,
      message_id,
      session_id,
      user_id,
      role,
      kind,
      mime_type,
      original_filename,
      file_path,
      duration_seconds,
      created_at
    FROM audio_records
    WHERE session_id = ?
    ORDER BY id ASC
    `).all(sessionId);
}
