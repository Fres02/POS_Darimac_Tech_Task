import type { RequestHandler } from "express";
import type { Role } from "@pos/shared";
import { HttpError } from "../lib/http-error";

export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new HttpError(403, "Forbidden"));
      return;
    }
    next();
  };
}
