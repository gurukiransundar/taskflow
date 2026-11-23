import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// The access token lives in memory only (not localStorage), for safety
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send the refresh-token cookie
});

// Before every request: attach the access token
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// If several requests fail at once, refresh only ONCE and share the result
let refreshPromise: Promise<string | null> | null = null;

export function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/api/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        setAccessToken(res.data.accessToken);
        return res.data.accessToken as string;
      })
      .catch(() => {
        setAccessToken(null);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// These must never trigger an auto-refresh (it would loop)
const SKIP_REFRESH = ["/api/auth/login", "/api/auth/register", "/api/auth/refresh"];

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// After every response: if 401, refresh the token and try again once
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const url = original?.url ?? "";

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !SKIP_REFRESH.some((path) => url.includes(path))
    ) {
      original._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) return api(original);
    }

    return Promise.reject(error);
  },
);

export default api;