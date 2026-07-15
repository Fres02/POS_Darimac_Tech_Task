import { type ReactNode, useCallback } from "react";
import { toast } from "sonner";
import { AppHeader } from "./AppHeader";
import { AppFooter } from "./AppFooter";
import { useAuth } from "@/context/AuthContext";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  const handleIdle = useCallback(() => {
    logout();
    toast.info("You've been logged out due to inactivity.");
  }, [logout]);

  useIdleTimeout(IDLE_TIMEOUT_MS, handleIdle, !!user);

  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <AppFooter />
    </div>
  );
}
