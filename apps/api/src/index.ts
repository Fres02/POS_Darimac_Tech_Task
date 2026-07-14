import express from "express";
import { pinoHttp } from "pino-http";
import { env } from "./env";
import { logger } from "./logger";

const app = express();

app.use(pinoHttp({ logger }));

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.listen(env.PORT, () => {
  logger.info(`API listening on port ${env.PORT} (${env.NODE_ENV})`);
});
