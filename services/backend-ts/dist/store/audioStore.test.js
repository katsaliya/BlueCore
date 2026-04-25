"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const migrate_1 = require("../db/migrate");
const sqliteSessionStore_1 = require("./sqliteSessionStore");
const audioStore_1 = require("./audioStore");
(0, migrate_1.runMigrations)();
const session = (0, sqliteSessionStore_1.createSqliteSession)(null);
const record = (0, audioStore_1.saveAudioBuffer)({
    sessionId: session.sessionId,
    userId: null,
    role: "user",
    kind: "input",
    mimeType: "audio/wav",
    originalFilename: "demo.wav",
    durationSeconds: 2.5,
    buffer: Buffer.from("fake-audio-data"),
    extension: ".wav",
    messageId: null
});
console.log("SESSION:", session);
console.log("SAVED:", record);
const records = (0, audioStore_1.listAudioRecordsForSession)(session.sessionId);
console.log("LIST:", records);
