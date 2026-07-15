import { create } from "zustand";
import type { Discount, Product, UnitType } from "@pos/shared";

export type CartLine = {
  productId: string;
  name: string;
  unitPrice: number;
  taxRate: number;
  unitType: UnitType;
  qty: number;
  discount?: Discount;
};

type CartState = {
  lines: CartLine[];
  discount: Discount | undefined;
  addProduct: (product: Product) => void;
  updateQty: (productId: string, qty: number) => void;
  removeLine: (productId: string) => void;
  setDiscount: (discount: Discount | undefined) => void;
  setLineDiscount: (productId: string, discount: Discount | undefined) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  lines: [],
  discount: undefined,

  addProduct: (product) =>
    set((state) => {
      const existing = state.lines.find((l) => l.productId === product.id);
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.productId === product.id ? { ...l, qty: l.qty + 1 } : l,
          ),
        };
      }
      return {
        lines: [
          ...state.lines,
          {
            productId: product.id,
            name: product.name,
            unitPrice: product.priceLkr,
            taxRate: product.taxRate,
            unitType: product.unitType,
            qty: 1,
          },
        ],
      };
    }),

  updateQty: (productId, qty) =>
    set((state) => ({
      lines:
        qty <= 0
          ? state.lines.filter((l) => l.productId !== productId)
          : state.lines.map((l) => (l.productId === productId ? { ...l, qty } : l)),
    })),

  removeLine: (productId) =>
    set((state) => ({ lines: state.lines.filter((l) => l.productId !== productId) })),

  setDiscount: (discount) => set({ discount }),

  setLineDiscount: (productId, discount) =>
    set((state) => ({
      lines: state.lines.map((l) => (l.productId === productId ? { ...l, discount } : l)),
    })),

  clear: () => set({ lines: [], discount: undefined }),
}));
