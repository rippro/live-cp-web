"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@/lib/auth/types";
import { getSessionDisplayName } from "@/lib/auth/types";
import { addRecentAccount } from "@/lib/auth/recent-accounts";

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = (await res.json()) as { session: Session | null; token: string | null };
      setSession(data.session);
      if (data.session && data.token) {
        addRecentAccount({
          id: data.session.role === "solver" ? data.session.userId : data.session.uid,
          role: data.session.role,
          displayName: getSessionDisplayName(data.session),
          token: data.token,
        });
      }
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ session, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
