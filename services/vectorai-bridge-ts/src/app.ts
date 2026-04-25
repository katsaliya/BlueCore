import express from "express";
import cors from "cors";
import { env } from "./config/env";
import healthRouter from "./routes/health";
import vectorAiRouter from "./routes/vectorai";

const app = express();

app.use(cors());
app.use(express.json());

app.use(healthRouter);
app.use(vectorAiRouter);

app.listen(env.PORT, env.HOST, () => {
  console.log(`VectorAI bridge listening on http://${env.HOST}:${env.PORT}`);
});