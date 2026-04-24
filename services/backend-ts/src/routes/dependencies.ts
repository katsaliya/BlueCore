import { Router } from "express";
import { LocalLlmStubProvider } from "../providers/llm/LocalLlmStubProvider";
import { VectorAiStubProvider } from "../providers/vectorai/VectorAiStubProvider";
import { DependenciesHealthResponse } from "../types/dependencies";

const router = Router();

const llmProvider = new LocalLlmStubProvider();
const vectorProvider = new VectorAiStubProvider();

router.get("/health/dependencies", async (_req, res) => {
  const dependencies = [
    await llmProvider.getHealth(),
    await vectorProvider.getHealth()
  ];

  const response: DependenciesHealthResponse = {
    ok: dependencies.every((dep) => dep.ok),
    dependencies
  };

  res.status(200).json(response);
});

export default router;