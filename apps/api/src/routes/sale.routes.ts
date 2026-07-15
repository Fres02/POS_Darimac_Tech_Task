import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import { create, list, detail } from "../controllers/sale.controller";

export const saleRouter = Router();

saleRouter.use(requireAuth);
saleRouter.post("/", create);
saleRouter.get("/", list);
saleRouter.get("/:id", detail);
