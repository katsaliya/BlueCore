import fs from "fs";
import path from "path";
import { db } from "../db/sqlite";

export type AudioRecord = {
  id: number;
  messageId: number | null;
  sessionId: string;
  userId: number | null;
  role: string;
  kind: string;
  mimeType: string | null;
  originalFilename: string | null;
  filePath: string;
  durationSeconds: number | null;
  createdAt: string;
};

const audioRoot = path.resolve(process.cwd(), "data", "audio");

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

ensureDir(audioRoot);

export function saveAudioBuffer(params: {
  sessionId: string;
  userId: number | null;
  role: string;
  kind: string;
  mimeType?: string | null;
  originalFilename?: string | null;
  durationSeconds?: number | null;
  buffer: Buffer;
  extension: string;
  messageId?: number | null;
}) {
  const createdAt = new Date().toISOString();
  const sessionDir = path.join(audioRoot, params.sessionId);
  ensureDir(sessionDir);

  const safeExt = params.extension.startsWith(".")
    ? params.extension
    : `.${params.extension}`;

  const filename = `${Date.now()}-${params.role}-${params.kind}${safeExt}`;
  const filePath = path.join(sessionDir, filename);

  fs.writeFileSync(filePath, params.buffer);

  const result = db.prepare(
    `
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
    `
  ).run(
    params.messageId ?? null,
    params.sessionId,
    params.userId ?? null,
    params.role,
    params.kind,
    params.mimeType ?? null,
    params.originalFilename ?? null,
    filePath,
    params.durationSeconds ?? null,
    createdAt
  );

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
  } satisfies AudioRecord;
}

export function listAudioRecordsForSession(sessionId: string) {
  return db.prepare(
    `
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
    `
  ).all(sessionId) as Array<{
    id: number;
    message_id: number | null;
    session_id: string;
    user_id: number | null;
    role: string;
    kind: string;
    mime_type: string | null;
    original_filename: string | null;
    file_path: string;
    duration_seconds: number | null;
    created_at: string;
  }>;
}