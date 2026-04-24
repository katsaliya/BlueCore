import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT || 8080),
  HOST: process.env.HOST || "127.0.0.1",
  NODE_ENV: process.env.NODE_ENV || "development",

  VECTORAI_BRIDGE_BASE_URL:
    process.env.VECTORAI_BRIDGE_BASE_URL || "http://127.0.0.1:50054",
  VECTORAI_BRIDGE_HEALTH_PATH:
    process.env.VECTORAI_BRIDGE_HEALTH_PATH || "/health",

  LLM_BASE_URL: process.env.LLM_BASE_URL || "http://127.0.0.1:11434",
  LLM_HEALTH_PATH: process.env.LLM_HEALTH_PATH || "/api/tags",

  VOICE_BRIDGE_BASE_URL:
    process.env.VOICE_BRIDGE_BASE_URL || "http://127.0.0.1:50055"
};