import express from "express";
import cors from "cors";
import healthRouter from "./routes/health";
import dependenciesRouter from "./routes/dependencies";
import vectorAiRouter from "./routes/vectorai";
import vectorAiBridgeRouter from "./routes/vectoraiBridge";
import sessionRouter from "./routes/session";
import { env } from "./config/env";

const app = express();

app.use(cors());
app.use(express.json());

app.use(healthRouter);
app.use(dependenciesRouter);
app.use(vectorAiRouter);
app.use(vectorAiBridgeRouter);
app.use(sessionRouter);

app.listen(env.PORT, env.HOST, () => {
  console.log(`GreenWatch backend listening on http://${env.HOST}:${env.PORT}`);
});