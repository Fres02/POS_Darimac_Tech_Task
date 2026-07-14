import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { createProductInputSchema, updateProductInputSchema } from "@pos/shared";
import * as productService from "../services/product.service";

const searchQuerySchema = z.object({ q: z.string().trim().min(1).optional() });

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { q } = searchQuerySchema.parse(req.query);
    const products = await productService.listProducts(q);
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createProductInputSchema.parse(req.body);
    const product = await productService.createProduct(input);
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateProductInputSchema.parse(req.body);
    const product = await productService.updateProduct(req.params.id, input);
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function deactivate(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.deactivateProduct(req.params.id);
    res.json({ product });
  } catch (err) {
    next(err);
  }
}
