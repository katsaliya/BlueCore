import { Router } from "express";
import { env } from "../config/env";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "greenwatch-backend",
    port: env.PORT,
    host: env.HOST,
    environment: env.NODE_ENV
  });
});

export default router;