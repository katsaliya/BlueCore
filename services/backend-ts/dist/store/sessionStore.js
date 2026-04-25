"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.getSession = getSession;
exports.appendMessage = appendMessage;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dataDir = path_1.default.resolve(process.cwd(), "data");
const sessionFilePath = path_1.default.join(dataDir, "sessions.json");
function ensureDataFile() {
    if (!fs_1.default.existsSync(dataDir)) {
        fs_1.default.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs_1.default.existsSync(sessionFilePath)) {
        fs_1.default.writeFileSync(sessionFilePath, JSON.stringify({}, null, 2), "utf-8");
    }
}
function loadSessions() {
    ensureDataFile();
    try {
        const raw = fs_1.default.readFileSync(sessionFilePath, "utf-8");
        const parsed = JSON.parse(raw);
        return new Map(Object.entries(parsed));
    }
    catch {
        return new Map();
    }
}
function saveSessions(sessions) {
    ensureDataFile();
    const obj = Object.fromEntries(sessions.entries());
    fs_1.default.writeFileSync(sessionFilePath, JSON.stringify(obj, null, 2), "utf-8");
}
const sessions = loadSessions();
function generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function createSession() {
    const session = {
        sessionId: generateSessionId(),
        createdAt: new Date().toISOString(),
        history: []
    };
    sessions.set(session.sessionId, session);
    saveSessions(sessions);
    return session;
}
function getSession(sessionId) {
    return sessions.get(sessionId);
}
function appendMessage(sessionId, message) {
    const session = sessions.get(sessionId);
    if (!session) {
        return undefined;
    }
    session.history.push(message);
    sessions.set(sessionId, session);
    saveSessions(sessions);
    return session;
}
