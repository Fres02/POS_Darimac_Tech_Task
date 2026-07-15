import { apiFetch } from "./api";

export async function resendTodayReport(): Promise<{ reportDate: string }> {
  return apiFetch<{ reportDate: string }>("/api/reports/resend-today", { method: "POST" });
}
