import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import { requireRole } from "../middleware/require-role";
import { resendToday } from "../controllers/report.controller";

export const reportRouter = Router();

reportRouter.use(requireAuth, requireRole("admin"));
reportRouter.post("/resend-today", resendToday);
