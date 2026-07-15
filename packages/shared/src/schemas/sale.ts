import { z } from "zod";
import { moneySchema } from "./common";

export const paymentMethodSchema = z.enum(["cash"]);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const discountSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("amount"), value: moneySchema }),
  z.object({ type: z.literal("percent"), value: z.number().min(0).max(100) }),
]);
export type Discount = z.infer<typeof discountSchema>;

export const saleItemInputSchema = z.object({
  productId: z.string().uuid(),
  qty: z.number().int().positive(),
});
export type SaleItemInput = z.infer<typeof saleItemInputSchema>;

export const createSaleInputSchema = z.object({
  items: z.array(saleItemInputSchema).min(1),
  discount: discountSchema.optional(),
  paymentMethod: paymentMethodSchema.default("cash"),
  cashTendered: moneySchema,
});
export type CreateSaleInput = z.infer<typeof createSaleInputSchema>;

export const saleItemSchema = z.object({
  id: z.string().uuid(),
  saleId: z.string().uuid(),
  productId: z.string().uuid(),
  nameSnapshot: z.string().min(1),
  unitPriceSnapshot: moneySchema,
  qty: z.number().int().positive(),
  lineTotal: moneySchema,
});
export type SaleItem = z.infer<typeof saleItemSchema>;

export const saleSchema = z.object({
  id: z.string().uuid(),
  cashierId: z.string().uuid(),
  cashierName: z.string(),
  subtotal: moneySchema,
  tax: moneySchema,
  discount: moneySchema,
  total: moneySchema,
  paymentMethod: paymentMethodSchema,
  cashTendered: moneySchema,
  change: moneySchema,
  createdAt: z.string().datetime(),
  items: z.array(saleItemSchema),
});
export type Sale = z.infer<typeof saleSchema>;

export const saleSummarySchema = saleSchema.omit({ items: true });
export type SaleSummary = z.infer<typeof saleSummarySchema>;
