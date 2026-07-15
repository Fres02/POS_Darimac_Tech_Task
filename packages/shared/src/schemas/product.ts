import { z } from "zod";
import { moneySchema, unitTypeSchema } from "./common";

export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  sku: z.string().min(1).optional(),
  priceLkr: moneySchema,
  taxRate: z.number().min(0).max(1),
  unitType: unitTypeSchema,
  active: z.boolean(),
  stockQty: z.number().int().nonnegative().optional(),
});
export type Product = z.infer<typeof productSchema>;

export const createProductInputSchema = productSchema.omit({ id: true });
export type CreateProductInput = z.infer<typeof createProductInputSchema>;

export const updateProductInputSchema = createProductInputSchema.partial();
export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;
