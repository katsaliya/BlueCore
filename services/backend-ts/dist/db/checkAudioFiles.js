"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const sqlite_1 = require("./sqlite");
const rows = sqlite_1.db.prepare(`
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
`).all();
for (const row of rows) {
    const exists = fs_1.default.existsSync(row.file_path);
    let size = 0;
    let firstBytesHex = "";
    if (exists) {
        const buffer = fs_1.default.readFileSync(row.file_path);
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
