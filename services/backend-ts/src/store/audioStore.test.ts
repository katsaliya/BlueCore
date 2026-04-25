import { runMigrations } from "../db/migrate";
import { createSqliteSession } from "./sqliteSessionStore";
import { saveAudioBuffer, listAudioRecordsForSession } from "./audioStore";

runMigrations();

const session = createSqliteSession(null);

const record = saveAudioBuffer({
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

const records = listAudioRecordsForSession(session.sessionId);
console.log("LIST:", records);