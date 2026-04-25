import { runMigrations } from "../db/migrate";
import {
  appendSqliteMessage,
  createSqliteSession,
  getSqliteSession,
  userOwnsSession
} from "./sqliteSessionStore";

runMigrations();

const session = createSqliteSession(1);
console.log("CREATED:", session);

appendSqliteMessage(session.sessionId, {
  role: "user",
  text: "I feel tired before my shift",
  timestamp: new Date().toISOString()
});

appendSqliteMessage(session.sessionId, {
  role: "assistant",
  text: "Please rest and hydrate.",
  timestamp: new Date().toISOString()
});

const loaded = getSqliteSession(session.sessionId);
console.log("LOADED:", JSON.stringify(loaded, null, 2));
console.log("OWNS SESSION:", userOwnsSession(1, session.sessionId));
console.log("OTHER USER OWNS SESSION:", userOwnsSession(999, session.sessionId));