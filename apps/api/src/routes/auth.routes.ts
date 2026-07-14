import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login } from "../controllers/auth.controller";

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again later." },
});

export const authRouter = Router();
authRouter.post("/login", loginRateLimit, login);
