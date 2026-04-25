import fs from "fs";
import path from "path";
import { db } from "./sqlite";

const rows = db.prepare(`
  SELECT
    id,
    session_id,
    role,
    kind,
    mime_type,
    original_filename,
    file_path,
    created_at
  FROM audio_records
  ORDER BY id DESC
  LIMIT 10
`).all() as Array<{
  id: number;
  session_id: string;
  role: string;
  kind: string;
  mime_type: string | null;
  original_filename: string | null;
  file_path: string;
  created_at: string;
}>;

for (const row of rows) {
  const exists = fs.existsSync(row.file_path);
  let size = 0;
  let firstBytesHex = "";

  if (exists) {
    const buffer = fs.readFileSync(row.file_path);
    size = buffer.length;
    firstBytesHex = buffer.subarray(0, 16).toString("hex");
  }

  console.log({
    id: row.id,
    sessionId: row.session_id,
    role: row.role,
    kind: row.kind,
    mimeType: row.mime_type,
    originalFilename: row.original_filename,
    filePath: row.file_path,
    exists,
    size,
    firstBytesHex,
    createdAt: row.created_at
  });
}