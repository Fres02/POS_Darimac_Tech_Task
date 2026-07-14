import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { loginRequestSchema, loginResponseSchema, type Role } from "@pos/shared";
import { supabase } from "../lib/supabase";
import { apiFetch } from "../lib/api";

type AuthUser = {
  id: string;
  fullName: string;
  role: Role;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        try {
          const { user: restored } = await apiFetch<{ user: AuthUser }>("/api/me");
          if (active) setUser(restored);
        } catch {
          await supabase.auth.signOut();
          if (active) setUser(null);
        }
      }
      if (active) setLoading(false);
    }
    restoreSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setUser(null);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function login(email: string, password: string) {
    const body = loginRequestSchema.parse({ email, password });
    const result = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const { accessToken, refreshToken, profile } = loginResponseSchema.parse(result);

    await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });

    const authUser: AuthUser = { id: profile.id, fullName: profile.fullName, role: profile.role };
    setUser(authUser);
    return authUser;
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
