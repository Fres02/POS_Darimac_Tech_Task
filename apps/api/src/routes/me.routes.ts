import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";

export const meRouter = Router();

meRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});
