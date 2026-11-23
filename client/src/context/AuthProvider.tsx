import { useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "./auth-context";
import { refreshAccessToken } from "../api/axios";
import { getMe, loginRequest, logoutRequest, registerRequest } from "../api/auth";
import type { User } from "../types";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // When the app opens: try to restore the session using the refresh cookie
  useEffect(() => {
    async function restoreSession() {
      const token = await refreshAccessToken();
      if (token) {
        try {
          setUser(await getMe());
        } catch {
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    restoreSession();
  }, []);

  async function login(email: string, password: string) {
    setUser(await loginRequest(email, password));
  }

  async function register(name: string, email: string, password: string) {
    setUser(await registerRequest(name, email, password));
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}