import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import { requireRole } from "../middleware/require-role";
import { list, create, update, deactivate } from "../controllers/product.controller";

export const productRouter = Router();

productRouter.use(requireAuth);
productRouter.get("/", list);
productRouter.post("/", requireRole("admin"), create);
productRouter.patch("/:id", requireRole("admin"), update);
productRouter.delete("/:id", requireRole("admin"), deactivate);
