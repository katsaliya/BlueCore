"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const LocalLlmStubProvider_1 = require("../providers/llm/LocalLlmStubProvider");
const VectorAiStubProvider_1 = require("../providers/vectorai/VectorAiStubProvider");
const router = (0, express_1.Router)();
const llmProvider = new LocalLlmStubProvider_1.LocalLlmStubProvider();
const vectorProvider = new VectorAiStubProvider_1.VectorAiStubProvider();
router.get("/health/dependencies", async (_req, res) => {
    const dependencies = [
        await llmProvider.getHealth(),
        await vectorProvider.getHealth()
    ];
    const response = {
        ok: dependencies.every((dep) => dep.ok),
        dependencies
    };
    res.status(200).json(response);
});
exports.default = router;
