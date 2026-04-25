"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const vectoraiBridge_1 = require("../services/vectoraiBridge");
const router = (0, express_1.Router)();
const initSchema = zod_1.z.object({
    namespace: zod_1.z.string().min(1).optional()
});
const upsertSchema = zod_1.z.object({
    namespace: zod_1.z.string().min(1).optional(),
    records: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().min(1),
        text: zod_1.z.string().min(1),
        metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional()
    })).min(1)
});
const querySchema = zod_1.z.object({
    namespace: zod_1.z.string().min(1).optional(),
    text: zod_1.z.string().min(1),
    topK: zod_1.z.number().int().positive().max(50).optional()
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
        const result = await (0, vectoraiBridge_1.initVectorAiBridge)(parsed.data);
        return res.status(result.status).json(result.data);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "unknown bridge error";
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
        const result = await (0, vectoraiBridge_1.upsertVectorAiBridge)(parsed.data);
        return res.status(result.status).json(result.data);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "unknown bridge error";
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
        const result = await (0, vectoraiBridge_1.queryVectorAiBridge)(parsed.data);
        return res.status(result.status).json(result.data);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "unknown bridge error";
        return res.status(502).json({
            ok: false,
            message: `Failed to call VectorAI bridge (${message})`
        });
    }
});
exports.default = router;
