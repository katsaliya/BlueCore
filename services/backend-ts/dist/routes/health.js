"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
router.get("/health", (_req, res) => {
    res.status(200).json({
        ok: true,
        service: "greenwatch-backend",
        port: env_1.env.PORT,
        host: env_1.env.HOST,
        environment: env_1.env.NODE_ENV
    });
});
exports.default = router;
