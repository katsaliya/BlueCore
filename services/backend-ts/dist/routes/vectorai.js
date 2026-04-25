"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const grpc_1 = require("../providers/vectorai/grpc");
const router = (0, express_1.Router)();
router.get("/debug/vectorai", (_req, res) => {
    const client = new grpc_1.VectorAiGrpcClient();
    res.status(200).json({
        ok: true,
        transport: "grpc",
        address: client.getAddress()
    });
});
exports.default = router;
