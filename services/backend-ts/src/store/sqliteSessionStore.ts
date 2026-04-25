import { db } from "../db/sqlite";

export type SessionMessage = {
  role: "user" | "assistant";
  text: string;
  timestamp: string;
};

export type SessionRecord = {
  sessionId: string;
  userId: number | null;
  createdAt: string;
  history: SessionMessage[];
};

export type SessionListItem = {
  sessionId: string;
  userId: number | null;
  createdAt: string;
  messageCount: number;
  lastMessageAt: string | null;
};

function makeSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createSqliteSession(userId: number | null) {
  const sessionId = makeSessionId();
  const createdAt = new Date().toISOString();

  db.prepare(
    `
    INSERT INTO sessions (session_id, user_id, created_at)
    VALUES (?, ?, ?)
    `
  ).run(sessionId, userId, createdAt);

  return {
    sessionId,
    userId,
    createdAt,
    history: []
  } satisfies SessionRecord;
}

export function getSqliteSession(sessionId: string): SessionRecord | null {
  const sessionRow = db.prepare(
    `
    SELECT session_id, user_id, created_at
    FROM sessions
    WHERE session_id = ?
    `
  ).get(sessionId) as
    | {
        session_id: string;
        user_id: number | null;
        created_at: string;
      }
    | undefined;

  if (!sessionRow) {
    return null;
  }

  const historyRows = db.prepare(
    `
    SELECT role, text, timestamp
    FROM messages
    WHERE session_id = ?
    ORDER BY id ASC
    `
  ).all(sessionId) as Array<{
    role: "user" | "assistant";
    text: string;
    timestamp: string;
  }>;

  return {
    sessionId: sessionRow.session_id,
    userId: sessionRow.user_id,
    createdAt: sessionRow.created_at,
    history: historyRows.map((row) => ({
      role: row.role,
      text: row.text,
      timestamp: row.timestamp
    }))
  };
}

export function appendSqliteMessage(
  sessionId: string,
  message: SessionMessage
): SessionRecord | null {
  const sessionExists = db.prepare(
    `
    SELECT 1
    FROM sessions
    WHERE session_id = ?
    `
  ).get(sessionId);

  if (!sessionExists) {
    return null;
  }

  db.prepare(
    `
    INSERT INTO messages (session_id, role, text, timestamp)
    VALUES (?, ?, ?, ?)
    `
  ).run(sessionId, message.role, message.text, message.timestamp);

  return getSqliteSession(sessionId);
}

export function appendSqliteMessageWithId(
  sessionId: string,
  message: SessionMessage
) {
  const sessionExists = db.prepare(
    `
    SELECT 1
    FROM sessions
    WHERE session_id = ?
    `
  ).get(sessionId);

  if (!sessionExists) {
    return null;
  }

  const result = db.prepare(
    `
    INSERT INTO messages (session_id, role, text, timestamp)
    VALUES (?, ?, ?, ?)
    `
  ).run(sessionId, message.role, message.text, message.timestamp);

  return {
    messageId: Number(result.lastInsertRowid),
    session: getSqliteSession(sessionId)
  };
}

export function userOwnsSession(userId: number, sessionId: string) {
  const row = db.prepare(
    `
    SELECT 1
    FROM sessions
    WHERE session_id = ? AND user_id = ?
    `
  ).get(sessionId, userId);

  return !!row;
}

export function listUserSessions(userId: number): SessionListItem[] {
  const rows = db.prepare(
    `
    SELECT
      s.session_id,
      s.user_id,
      s.created_at,
      COUNT(m.id) AS message_count,
      MAX(m.timestamp) AS last_message_at
    FROM sessions s
    LEFT JOIN messages m
      ON m.session_id = s.session_id
    WHERE s.user_id = ?
    GROUP BY s.session_id, s.user_id, s.created_at
    ORDER BY COALESCE(MAX(m.timestamp), s.created_at) DESC
    `
  ).all(userId) as Array<{
    session_id: string;
    user_id: number | null;
    created_at: string;
    message_count: number;
    last_message_at: string | null;
  }>;

  return rows.map((row) => ({
    sessionId: row.session_id,
    userId: row.user_id,
    createdAt: row.created_at,
    messageCount: Number(row.message_count),
    lastMessageAt: row.last_message_at
  }));
}