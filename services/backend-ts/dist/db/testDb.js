"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite_1 = require("./sqlite");
const migrate_1 = require("./migrate");
(0, migrate_1.runMigrations)();
const tables = sqlite_1.db
    .prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
    ORDER BY name
  `)
    .all();
console.log("DB OK");
console.log("TABLES:", tables);
