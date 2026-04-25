import { Router } from "express";
import { env } from "../config/env";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "greenwatch-vectorai-bridge",
    host: env.HOST,
    port: env.PORT,
    environment: env.NODE_ENV
  });
});

router.get("/debug/ping", (_req, res) => {
  res.status(200).json({
    ok: true,
    message: "vectorai bridge reachable"
  });
});

export default router;