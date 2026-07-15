import type { CreateSaleInput, Sale, SaleSummary } from "@pos/shared";
import { apiFetch } from "./api";

export async function checkout(input: CreateSaleInput): Promise<Sale> {
  const { sale } = await apiFetch<{ sale: Sale }>("/api/sales", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return sale;
}

export async function fetchSales(): Promise<SaleSummary[]> {
  const { sales } = await apiFetch<{ sales: SaleSummary[] }>("/api/sales");
  return sales;
}

export async function fetchSaleDetail(id: string): Promise<Sale> {
  const { sale } = await apiFetch<{ sale: Sale }>(`/api/sales/${id}`);
  return sale;
}
