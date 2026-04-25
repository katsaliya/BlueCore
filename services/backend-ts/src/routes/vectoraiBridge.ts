import { Router } from "express";
import { z } from "zod";
import {
  initVectorAiBridge,
  queryVectorAiBridge,
  upsertVectorAiBridge
} from "../services/vectoraiBridge";

const router = Router();

const initSchema = z.object({
  namespace: z.string().min(1).optional()
});

const upsertSchema = z.object({
  namespace: z.string().min(1).optional(),
  records: z.array(
    z.object({
      id: z.string().min(1),
      text: z.string().min(1),
      metadata: z.record(z.string(), z.unknown()).optional()
    })
  ).min(1)
});

const querySchema = z.object({
  namespace: z.string().min(1).optional(),
  text: z.string().min(1),
  topK: z.number().int().positive().max(50).optional()
});

router.post("/debug/vectorai/init", async (req, res) => {
  const parsed = initSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: "Invalid backend /debug/vectorai/init request",
      issues: parsed.error.issues
    });
  }

  try {
    const result = await initVectorAiBridge(parsed.data);
    return res.status(result.status).json(result.data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unknown bridge error";

    return res.status(502).json({
      ok: false,
      message: `Failed to call VectorAI bridge (${message})`
    });
  }
});

router.post("/debug/vectorai/upsert", async (req, res) => {
  const parsed = upsertSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: "Invalid backend /debug/vectorai/upsert request",
      issues: parsed.error.issues
    });
  }

  try {
    const result = await upsertVectorAiBridge(parsed.data);
    return res.status(result.status).json(result.data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unknown bridge error";

    return res.status(502).json({
      ok: false,
      message: `Failed to call VectorAI bridge (${message})`
    });
  }
});

router.post("/debug/vectorai/query", async (req, res) => {
  const parsed = querySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: "Invalid backend /debug/vectorai/query request",
      issues: parsed.error.issues
    });
  }

  try {
    const result = await queryVectorAiBridge(parsed.data);
    return res.status(result.status).json(result.data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unknown bridge error";

    return res.status(502).json({
      ok: false,
      message: `Failed to call VectorAI bridge (${message})`
    });
  }
});

export default router;