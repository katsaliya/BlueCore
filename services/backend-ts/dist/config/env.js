"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    PORT: Number(process.env.PORT || 8080),
    HOST: process.env.HOST || "127.0.0.1",
    NODE_ENV: process.env.NODE_ENV || "development",
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://127.0.0.1:5173,http://localhost:5173",
    VECTORAI_BRIDGE_BASE_URL: process.env.VECTORAI_BRIDGE_BASE_URL || "http://127.0.0.1:50054",
    VECTORAI_BRIDGE_HEALTH_PATH: process.env.VECTORAI_BRIDGE_HEALTH_PATH || "/health",
    VECTORAI_HOST: process.env.VECTORAI_HOST || "127.0.0.1",
    VECTORAI_PORT: Number(process.env.VECTORAI_PORT || 50053),
    LLM_BASE_URL: process.env.LLM_BASE_URL || "http://127.0.0.1:11434",
    LLM_HEALTH_PATH: process.env.LLM_HEALTH_PATH || "/api/tags",
    VOICE_BRIDGE_BASE_URL: process.env.VOICE_BRIDGE_BASE_URL || "http://127.0.0.1:50055",
    JWT_SECRET: process.env.JWT_SECRET || "greenwatch-demo-secret",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d"
};
