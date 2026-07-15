import express from "express";
import cors from "cors";
import { sql } from "drizzle-orm";
import { pinoHttp } from "pino-http";
import { env } from "./env";
import { logger } from "./logger";
import { db } from "./db/client";
import { authRouter } from "./routes/auth.routes";
import { meRouter } from "./routes/me.routes";
import { productRouter } from "./routes/product.routes";
import { saleRouter } from "./routes/sale.routes";
import { userRouter } from "./routes/user.routes";
import { dashboardRouter } from "./routes/dashboard.routes";
import { errorHandler } from "./middleware/error-handler";

const app = express();

app.use(cors({ origin: env.WEB_ORIGIN }));
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/health", async (_req, res) => {
  // Also doubles as the keep-warm ping target: touching the DB here keeps
  // Supabase's free-tier project from auto-pausing after 7 days idle.
  try {
    await db.execute(sql`select 1`);
    res.json({ status: "ok", uptime: process.uptime(), db: "ok" });
  } catch (err) {
    logger.error(err, "Health check DB ping failed");
    res.status(503).json({ status: "degraded", uptime: process.uptime(), db: "unreachable" });
  }
});

app.use("/api/auth", authRouter);
app.use("/api", meRouter);
app.use("/api/products", productRouter);
app.use("/api/sales", saleRouter);
app.use("/api/users", userRouter);
app.use("/api/dashboard", dashboardRouter);

app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`API listening on port ${env.PORT} (${env.NODE_ENV})`);
});
