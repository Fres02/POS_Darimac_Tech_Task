import type { Request, Response, NextFunction } from "express";
import { createSaleInputSchema, saleSchema, saleSummarySchema } from "@pos/shared";
import { createSale } from "../services/sale.service";
import { listSales, getSaleDetail } from "../services/sale-history.service";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createSaleInputSchema.parse(req.body);
    const sale = await createSale(req.user!.id, req.user!.fullName, input);
    res.status(201).json({ sale: saleSchema.parse(sale) });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const results = await listSales({ id: req.user!.id, role: req.user!.role });
    res.json({ sales: results.map((sale) => saleSummarySchema.parse(sale)) });
  } catch (err) {
    next(err);
  }
}

export async function detail(req: Request, res: Response, next: NextFunction) {
  try {
    const sale = await getSaleDetail(req.params.id, { id: req.user!.id, role: req.user!.role });
    res.json({ sale: saleSchema.parse(sale) });
  } catch (err) {
    next(err);
  }
}
