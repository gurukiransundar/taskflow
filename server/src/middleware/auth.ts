import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyAccessToken, type TokenPayload } from "../utils/jwt.js";

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "Not logged in");
  }

  const token = header.split(" ")[1] ?? "";

  let payload: TokenPayload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new AppError(401, "Session expired, please log in again");
  }

  req.user = { id: payload.userId };
  next();
};