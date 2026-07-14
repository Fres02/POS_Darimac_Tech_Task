import express from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import { env } from "./env";
import { logger } from "./logger";
import { authRouter } from "./routes/auth.routes";
import { meRouter } from "./routes/me.routes";
import { errorHandler } from "./middleware/error-handler";

const app = express();

app.use(cors({ origin: env.WEB_ORIGIN }));
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/auth", authRouter);
app.use("/api", meRouter);

app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`API listening on port ${env.PORT} (${env.NODE_ENV})`);
});
