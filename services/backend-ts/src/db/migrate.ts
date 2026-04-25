import { db } from "./sqlite";

export function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      role TEXT NOT NULL DEFAULT 'sailor',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL UNIQUE,
      user_id INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      text TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audio_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id INTEGER,
      session_id TEXT NOT NULL,
      user_id INTEGER,
      role TEXT NOT NULL,
      kind TEXT NOT NULL,
      mime_type TEXT,
      original_filename TEXT,
      file_path TEXT NOT NULL,
      duration_seconds REAL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_messages_session_id
    ON messages(session_id);

    CREATE INDEX IF NOT EXISTS idx_messages_timestamp
    ON messages(timestamp);

    CREATE INDEX IF NOT EXISTS idx_audio_records_session_id
    ON audio_records(session_id);

    CREATE INDEX IF NOT EXISTS idx_audio_records_message_id
    ON audio_records(message_id);
  `);
}