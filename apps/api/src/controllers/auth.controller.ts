import type { Request, Response, NextFunction } from "express";
import { loginRequestSchema, loginResponseSchema } from "@pos/shared";
import { loginWithPassword } from "../services/auth.service";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const body = loginRequestSchema.parse(req.body);
    const result = await loginWithPassword(body.email, body.password);
    res.json(loginResponseSchema.parse(result));
  } catch (err) {
    next(err);
  }
}
