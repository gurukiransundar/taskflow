import api, { setAccessToken } from "./axios";
import type { User } from "../types";

interface AuthResponse {
  user: User;
  accessToken: string;
}

export async function loginRequest(email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/api/auth/login", { email, password });
  setAccessToken(data.accessToken);
  return data.user;
}

export async function registerRequest(name: string, email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/api/auth/register", { name, email, password });
  setAccessToken(data.accessToken);
  return data.user;
}

export async function logoutRequest() {
  try {
    await api.post("/api/auth/logout");
  } finally {
    setAccessToken(null);
  }
}

export async function getMe() {
  const { data } = await api.get<{ user: User }>("/api/auth/me");
  return data.user;
}