import fs from "fs";
import path from "path";
import { db } from "../db/sqlite";

export type DocumentOutputRecord = {
  id: number;
  documentRunId: number;
  outputType: string;
  outputMode: string;
  mimeType: string;
  filePath: string;
  createdAt: string;
};

const outputRoot = path.resolve(process.cwd(), "data", "document-outputs");

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

ensureDir(outputRoot);

export function saveDocumentOutputBuffer(params: {
  documentRunId: number;
  outputType: string;
  outputMode: string;
  mimeType: string;
  buffer: Buffer;
  extension: string;
}) {
  const createdAt = new Date().toISOString();
  const runDir = path.join(outputRoot, String(params.documentRunId));
  ensureDir(runDir);

  const safeExt = params.extension.startsWith(".")
    ? params.extension
    : `.${params.extension}`;

  const filename = `${Date.now()}-${params.outputMode}${safeExt}`;
  const filePath = path.join(runDir, filename);

  fs.writeFileSync(filePath, params.buffer);

  const result = db.prepare(`
    INSERT INTO document_outputs (
      document_run_id,
      output_type,
      output_mode,
      mime_type,
      file_path,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    params.documentRunId,
    params.outputType,
    params.outputMode,
    params.mimeType,
    filePath,
    createdAt
  );

  return {
    id: Number(result.lastInsertRowid),
    documentRunId: params.documentRunId,
    outputType: params.outputType,
    outputMode: params.outputMode,
    mimeType: params.mimeType,
    filePath,
    createdAt
  } satisfies DocumentOutputRecord;
}

export function listDocumentOutputsForRun(documentRunId: number) {
  const rows = db.prepare(`
    SELECT id, document_run_id, output_type, output_mode, mime_type, file_path, created_at
    FROM document_outputs
    WHERE document_run_id = ?
    ORDER BY id DESC
  `).all(documentRunId) as Array<{
    id: number;
    document_run_id: number;
    output_type: string;
    output_mode: string;
    mime_type: string;
    file_path: string;
    created_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    documentRunId: row.document_run_id,
    outputType: row.output_type,
    outputMode: row.output_mode,
    mimeType: row.mime_type,
    filePath: row.file_path,
    createdAt: row.created_at
  }));
}

export function getDocumentOutputById(id: number): DocumentOutputRecord | null {
  const row = db.prepare(`
    SELECT id, document_run_id, output_type, output_mode, mime_type, file_path, created_at
    FROM document_outputs
    WHERE id = ?
  `).get(id) as
    | {
        id: number;
        document_run_id: number;
        output_type: string;
        output_mode: string;
        mime_type: string;
        file_path: string;
        created_at: string;
      }
    | undefined;

  if (!row) return null;

  return {
    id: row.id,
    documentRunId: row.document_run_id,
    outputType: row.output_type,
    outputMode: row.output_mode,
    mimeType: row.mime_type,
    filePath: row.file_path,
    createdAt: row.created_at
  };
}

export function userOwnsDocumentOutput(userId: number, outputId: number) {
  const row = db.prepare(`
    SELECT 1
    FROM document_outputs o
    INNER JOIN document_runs r
      ON r.id = o.document_run_id
    WHERE o.id = ? AND r.user_id = ?
  `).get(outputId, userId);

  return !!row;
}