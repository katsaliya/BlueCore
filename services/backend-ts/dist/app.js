"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const health_1 = __importDefault(require("./routes/health"));
const dependencies_1 = __importDefault(require("./routes/dependencies"));
const vectorai_1 = __importDefault(require("./routes/vectorai"));
const vectoraiBridge_1 = __importDefault(require("./routes/vectoraiBridge"));
const session_1 = __importDefault(require("./routes/session"));
const auth_1 = __importDefault(require("./routes/auth"));
const env_1 = require("./config/env");
const migrate_1 = require("./db/migrate");
(0, migrate_1.runMigrations)();
const app = (0, express_1.default)();
const allowedOrigins = env_1.env.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error(`CORS origin not allowed: ${origin}`));
    }
}));
app.use(express_1.default.json());
app.use(health_1.default);
app.use(dependencies_1.default);
app.use(vectorai_1.default);
app.use(vectoraiBridge_1.default);
app.use(auth_1.default);
app.use(session_1.default);
app.listen(env_1.env.PORT, env_1.env.HOST, () => {
    console.log(`GreenWatch backend listening on http://${env_1.env.HOST}:${env_1.env.PORT}`);
});
