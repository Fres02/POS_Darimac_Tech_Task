import type { Discount } from "./schemas/sale";

export type PricedLine = {
  unitPriceSnapshot: number;
  qty: number;
  taxRate: number;
  // Optional per-line markdown, applied before the sale-level discount.
  discount?: Discount;
};

export type LineTotals = {
  gross: number;
  lineDiscount: number;
  net: number;
  tax: number;
};

export type SaleTotals = {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  lines: LineTotals[];
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function resolveDiscountAmount(base: number, discount: Discount | undefined): number {
  if (!discount) return 0;
  const raw = discount.type === "amount" ? discount.value : base * (discount.value / 100);
  return round2(Math.min(Math.max(raw, 0), base));
}

// Tax is computed per line on its own product's tax rate, against that
// line's price net of any per-line discount (a line discount reduces the
// taxable base, the same way a markdown does in practice). The sale-level
// discount is then subtracted from subtotal+tax, on top of any per-line
// discounts already applied. Used identically by checkout (source of truth)
// and the cart's live preview, so the two can never drift apart.
export function computeSaleTotals(lines: PricedLine[], discount?: Discount): SaleTotals {
  const lineTotals: LineTotals[] = lines.map((line) => {
    const gross = round2(line.unitPriceSnapshot * line.qty);
    const lineDiscount = resolveDiscountAmount(gross, line.discount);
    const net = round2(gross - lineDiscount);
    const tax = round2(net * line.taxRate);
    return { gross, lineDiscount, net, tax };
  });

  const subtotal = round2(lineTotals.reduce((sum, l) => sum + l.net, 0));
  const tax = round2(lineTotals.reduce((sum, l) => sum + l.tax, 0));

  const preDiscountTotal = subtotal + tax;
  const discountAmount = resolveDiscountAmount(preDiscountTotal, discount);
  const total = round2(preDiscountTotal - discountAmount);

  return { subtotal, tax, discount: discountAmount, total, lines: lineTotals };
}
