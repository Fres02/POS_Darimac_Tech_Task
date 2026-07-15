import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import { requireRole } from "../middleware/require-role";
import { get } from "../controllers/dashboard.controller";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth, requireRole("admin"));
dashboardRouter.get("/", get);
