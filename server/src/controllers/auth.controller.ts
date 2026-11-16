import type { CookieOptions, Request, Response } from "express";
import * as authService from "../services/auth.service.js";
import { isProd } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

const REFRESH_COOKIE = "refreshToken";

const cookieOptions: CookieOptions = {
  httpOnly: true, // JavaScript can't read it
  secure: isProd, // HTTPS only in production
  sameSite: isProd ? "none" : "lax",
  path: "/api/auth", // only sent to auth routes
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function register(req: Request, res: Response) {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
  res.status(201).json({ user, accessToken });
}

export async function login(req: Request, res: Response) {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
  res.json({ user, accessToken });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new AppError(401, "Not logged in");

  const { accessToken, refreshToken } = await authService.refresh(token);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
  res.json({ accessToken });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(REFRESH_COOKIE, cookieOptions);
  res.json({ message: "Logged out" });
}

export async function me(req: Request, res: Response) {
  const user = await authService.getUserById(req.user!.id);
  res.json({ user });
}