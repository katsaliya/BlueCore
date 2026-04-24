import { Router } from "express";
import { VectorAiGrpcClient } from "../providers/vectorai/grpc";

const router = Router();

router.get("/debug/vectorai", (_req, res) => {
  const client = new VectorAiGrpcClient();

  res.status(200).json({
    ok: true,
    transport: "grpc",
    address: client.getAddress()
  });
});

export default router;