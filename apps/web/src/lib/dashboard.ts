import type { Dashboard } from "@pos/shared";
import { apiFetch } from "./api";

export async function fetchDashboard(): Promise<Dashboard> {
  return apiFetch<Dashboard>("/api/dashboard");
}
