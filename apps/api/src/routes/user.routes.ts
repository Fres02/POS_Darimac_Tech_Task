import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import { requireRole } from "../middleware/require-role";
import { list, create } from "../controllers/user.controller";

export const userRouter = Router();

userRouter.use(requireAuth, requireRole("admin"));
userRouter.get("/", list);
userRouter.post("/", create);
