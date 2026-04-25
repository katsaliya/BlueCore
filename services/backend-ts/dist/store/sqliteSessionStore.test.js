"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const migrate_1 = require("../db/migrate");
const sqliteSessionStore_1 = require("./sqliteSessionStore");
(0, migrate_1.runMigrations)();
const session = (0, sqliteSessionStore_1.createSqliteSession)(1);
console.log("CREATED:", session);
(0, sqliteSessionStore_1.appendSqliteMessage)(session.sessionId, {
    role: "user",
    text: "I feel tired before my shift",
    timestamp: new Date().toISOString()
});
(0, sqliteSessionStore_1.appendSqliteMessage)(session.sessionId, {
    role: "assistant",
    text: "Please rest and hydrate.",
    timestamp: new Date().toISOString()
});
const loaded = (0, sqliteSessionStore_1.getSqliteSession)(session.sessionId);
console.log("LOADED:", JSON.stringify(loaded, null, 2));
console.log("OWNS SESSION:", (0, sqliteSessionStore_1.userOwnsSession)(1, session.sessionId));
console.log("OTHER USER OWNS SESSION:", (0, sqliteSessionStore_1.userOwnsSession)(999, session.sessionId));
