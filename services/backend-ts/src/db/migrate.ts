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

    CREATE TABLE IF NOT EXISTS document_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      schema_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS document_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_id TEXT,
      template_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE SET NULL,
      FOREIGN KEY (template_id) REFERENCES document_templates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS document_field_values (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_run_id INTEGER NOT NULL,
      field_name TEXT NOT NULL,
      field_value TEXT,
      source TEXT,
      confidence REAL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (document_run_id) REFERENCES document_runs(id) ON DELETE CASCADE,
      UNIQUE(document_run_id, field_name)
    );

    CREATE TABLE IF NOT EXISTS document_outputs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_run_id INTEGER NOT NULL,
      output_type TEXT NOT NULL,
      output_mode TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_path TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (document_run_id) REFERENCES document_runs(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_messages_session_id
    ON messages(session_id);

    CREATE INDEX IF NOT EXISTS idx_messages_timestamp
    ON messages(timestamp);

    CREATE INDEX IF NOT EXISTS idx_audio_records_session_id
    ON audio_records(session_id);

    CREATE INDEX IF NOT EXISTS idx_audio_records_message_id
    ON audio_records(message_id);

    CREATE INDEX IF NOT EXISTS idx_document_runs_user_id
    ON document_runs(user_id);

    CREATE INDEX IF NOT EXISTS idx_document_runs_session_id
    ON document_runs(session_id);

    CREATE INDEX IF NOT EXISTS idx_document_field_values_run_id
    ON document_field_values(document_run_id);

    CREATE INDEX IF NOT EXISTS idx_document_outputs_run_id
    ON document_outputs(document_run_id);
  `);
}