import { z } from "zod";
import { moneySchema, unitTypeSchema } from "./common";

export const paymentMethodSchema = z.enum(["cash"]);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const discountSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("amount"), value: moneySchema }),
  z.object({ type: z.literal("percent"), value: z.number().min(0).max(100) }),
]);
export type Discount = z.infer<typeof discountSchema>;

export const saleItemInputSchema = z.object({
  productId: z.string().uuid(),
  // Whole numbers for "each" products, fractional (e.g. 0.750) for kg/l —
  // enforced server-side once the product's unit type is known.
  qty: z.number().positive(),
  // Optional per-line markdown, independent of (and applied before) the
  // sale-level discount below.
  discount: discountSchema.optional(),
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
  unitTypeSnapshot: unitTypeSchema,
  qty: z.number().positive(),
  lineTotal: moneySchema,
  lineDiscount: moneySchema,
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
