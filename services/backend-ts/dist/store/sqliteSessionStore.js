"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSqliteSession = createSqliteSession;
exports.getSqliteSession = getSqliteSession;
exports.appendSqliteMessage = appendSqliteMessage;
exports.appendSqliteMessageWithId = appendSqliteMessageWithId;
exports.userOwnsSession = userOwnsSession;
exports.listUserSessions = listUserSessions;
const sqlite_1 = require("../db/sqlite");
function makeSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function createSqliteSession(userId) {
    const sessionId = makeSessionId();
    const createdAt = new Date().toISOString();
    sqlite_1.db.prepare(`
    INSERT INTO sessions (session_id, user_id, created_at)
    VALUES (?, ?, ?)
    `).run(sessionId, userId, createdAt);
    return {
        sessionId,
        userId,
        createdAt,
        history: []
    };
}
function getSqliteSession(sessionId) {
    const sessionRow = sqlite_1.db.prepare(`
    SELECT session_id, user_id, created_at
    FROM sessions
    WHERE session_id = ?
    `).get(sessionId);
    if (!sessionRow) {
        return null;
    }
    const historyRows = sqlite_1.db.prepare(`
    SELECT role, text, timestamp
    FROM messages
    WHERE session_id = ?
    ORDER BY id ASC
    `).all(sessionId);
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
function appendSqliteMessage(sessionId, message) {
    const sessionExists = sqlite_1.db.prepare(`
    SELECT 1
    FROM sessions
    WHERE session_id = ?
    `).get(sessionId);
    if (!sessionExists) {
        return null;
    }
    sqlite_1.db.prepare(`
    INSERT INTO messages (session_id, role, text, timestamp)
    VALUES (?, ?, ?, ?)
    `).run(sessionId, message.role, message.text, message.timestamp);
    return getSqliteSession(sessionId);
}
function appendSqliteMessageWithId(sessionId, message) {
    const sessionExists = sqlite_1.db.prepare(`
    SELECT 1
    FROM sessions
    WHERE session_id = ?
    `).get(sessionId);
    if (!sessionExists) {
        return null;
    }
    const result = sqlite_1.db.prepare(`
    INSERT INTO messages (session_id, role, text, timestamp)
    VALUES (?, ?, ?, ?)
    `).run(sessionId, message.role, message.text, message.timestamp);
    return {
        messageId: Number(result.lastInsertRowid),
        session: getSqliteSession(sessionId)
    };
}
function userOwnsSession(userId, sessionId) {
    const row = sqlite_1.db.prepare(`
    SELECT 1
    FROM sessions
    WHERE session_id = ? AND user_id = ?
    `).get(sessionId, userId);
    return !!row;
}
function listUserSessions(userId) {
    const rows = sqlite_1.db.prepare(`
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
    `).all(userId);
    return rows.map((row) => ({
        sessionId: row.session_id,
        userId: row.user_id,
        createdAt: row.created_at,
        messageCount: Number(row.message_count),
        lastMessageAt: row.last_message_at
    }));
}
