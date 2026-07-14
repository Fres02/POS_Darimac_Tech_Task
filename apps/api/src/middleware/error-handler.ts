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

  // Postgres unique_violation — e.g. duplicate product SKU
  if (typeof err === "object" && err !== null && "code" in err && err.code === "23505") {
    res.status(409).json({ error: "A record with this value already exists" });
    return;
  }

  logger.error(err);
  res.status(500).json({ error: "Internal server error" });
};
