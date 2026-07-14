import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../lib/http-error";
import { logger } from "../logger";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Invalid request", issues: err.issues });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Postgres unique_violation — e.g. duplicate product SKU.
  // Drizzle wraps the real PostgresError (which carries .code) as DrizzleQueryError#cause.
  const pgCode = (err as { code?: string })?.code ?? (err as { cause?: { code?: string } })?.cause?.code;
  if (pgCode === "23505") {
    res.status(409).json({ error: "A record with this value already exists" });
    return;
  }

  logger.error(err);
  res.status(500).json({ error: "Internal server error" });
};
