import fs from "fs";
import path from "path";

export type SessionMessage = {
  role: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
};

export type SessionRecord = {
  sessionId: string;
  createdAt: string;
  history: SessionMessage[];
};

const dataDir = path.resolve(process.cwd(), "data");
const sessionFilePath = path.join(dataDir, "sessions.json");

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(sessionFilePath)) {
    fs.writeFileSync(sessionFilePath, JSON.stringify({}, null, 2), "utf-8");
  }
}

function loadSessions(): Map<string, SessionRecord> {
  ensureDataFile();

  try {
    const raw = fs.readFileSync(sessionFilePath, "utf-8");
    const parsed = JSON.parse(raw) as Record<string, SessionRecord>;
    return new Map(Object.entries(parsed));
  } catch {
    return new Map();
  }
}

function saveSessions(sessions: Map<string, SessionRecord>) {
  ensureDataFile();

  const obj = Object.fromEntries(sessions.entries());
  fs.writeFileSync(sessionFilePath, JSON.stringify(obj, null, 2), "utf-8");
}

const sessions = loadSessions();

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createSession(): SessionRecord {
  const session: SessionRecord = {
    sessionId: generateSessionId(),
    createdAt: new Date().toISOString(),
    history: []
  };

  sessions.set(session.sessionId, session);
  saveSessions(sessions);
  return session;
}

export function getSession(sessionId: string): SessionRecord | undefined {
  return sessions.get(sessionId);
}

export function appendMessage(
  sessionId: string,
  message: SessionMessage
): SessionRecord | undefined {
  const session = sessions.get(sessionId);

  if (!session) {
    return undefined;
  }

  session.history.push(message);
  sessions.set(sessionId, session);
  saveSessions(sessions);
  return session;
}