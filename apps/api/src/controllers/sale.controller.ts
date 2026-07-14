import type { Request, Response, NextFunction } from "express";
import { createSaleInputSchema, saleSchema } from "@pos/shared";
import { createSale } from "../services/sale.service";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createSaleInputSchema.parse(req.body);
    const sale = await createSale(req.user!.id, input);
    res.status(201).json({ sale: saleSchema.parse(sale) });
  } catch (err) {
    next(err);
  }
}
