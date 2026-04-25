import { Router } from "express";
import { z } from "zod";
import {
  InitResponse,
  QueryResponse,
  UpsertResponse
} from "../types/api";
import {
  initNamespace,
  queryRecords,
  upsertRecords
} from "../store/memoryStore";

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

router.post("/init", (req, res) => {
  const parsed = initSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: "Invalid /init request",
      issues: parsed.error.issues
    });
  }

  const key = initNamespace(parsed.data.namespace);

  const response: InitResponse = {
    ok: true,
    message: `Initialized namespace: ${key}`
  };

  return res.status(200).json(response);
});

router.post("/upsert", (req, res) => {
  const parsed = upsertSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: "Invalid /upsert request",
      issues: parsed.error.issues
    });
  }

  const insertedCount = upsertRecords(
    parsed.data.namespace,
    parsed.data.records
  );

  const response: UpsertResponse = {
    ok: true,
    insertedCount,
    message: "Records stored in local memory stub"
  };

  return res.status(200).json(response);
});

router.post("/query", (req, res) => {
  const parsed = querySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: "Invalid /query request",
      issues: parsed.error.issues
    });
  }

  const matches = queryRecords(
    parsed.data.namespace,
    parsed.data.text,
    parsed.data.topK
  );

  const response: QueryResponse = {
    ok: true,
    matches,
    message: "Query served from local memory stub"
  };

  return res.status(200).json(response);
});

export default router;