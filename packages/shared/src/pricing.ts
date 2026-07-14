import type { Discount } from "./schemas/sale";

export type PricedLine = {
  unitPriceSnapshot: number;
  qty: number;
  taxRate: number;
};

export type SaleTotals = {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// Tax is computed per line on its own product's tax rate against the full
// pre-discount price; the discount is then subtracted from subtotal+tax.
// This avoids having to prorate one discount across lines that may carry
// different tax rates. Used identically by checkout (source of truth) and
// the cart's live preview, so the two can never drift apart.
export function computeSaleTotals(lines: PricedLine[], discount?: Discount): SaleTotals {
  const subtotal = round2(lines.reduce((sum, l) => sum + l.unitPriceSnapshot * l.qty, 0));
  const tax = round2(lines.reduce((sum, l) => sum + l.unitPriceSnapshot * l.qty * l.taxRate, 0));

  const preDiscountTotal = subtotal + tax;
  const rawDiscount = !discount
    ? 0
    : discount.type === "amount"
      ? discount.value
      : preDiscountTotal * (discount.value / 100);
  const discountAmount = round2(Math.min(Math.max(rawDiscount, 0), preDiscountTotal));

  const total = round2(preDiscountTotal - discountAmount);

  return { subtotal, tax, discount: discountAmount, total };
}
