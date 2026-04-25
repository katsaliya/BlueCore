import { db } from "./sqlite";
import { runMigrations } from "./migrate";

runMigrations();

const tables = db
  .prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
    ORDER BY name
  `)
  .all();

console.log("DB OK");
console.log("TABLES:", tables);