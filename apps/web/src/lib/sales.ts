import type { CreateSaleInput, Sale } from "@pos/shared";
import { apiFetch } from "./api";

export async function checkout(input: CreateSaleInput): Promise<Sale> {
  const { sale } = await apiFetch<{ sale: Sale }>("/api/sales", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return sale;
}
