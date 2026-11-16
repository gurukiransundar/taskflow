import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import type { LoginInput, RegisterInput } from "../validators/auth.validator.js";

// Fields that are safe to send to the frontend (never send passwordHash!)
const publicUser = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  createdAt: true,
} as const;

function createTokens(userId: string) {
  return {
    accessToken: signAccessToken(userId),
    refreshToken: signRefreshToken(userId),
  };
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError(409, "Email is already registered");

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
    select: publicUser,
  });

  return { user, ...createTokens(user.id) };
}

export async function login(input: LoginInput) {
  const found = await prisma.user.findUnique({ where: { email: input.email } });

  // Same message for both cases, so attackers can't tell which emails exist
  if (!found || !found.passwordHash) throw new AppError(401, "Invalid email or password");

  const isMatch = await bcrypt.compare(input.password, found.passwordHash);
  if (!isMatch) throw new AppError(401, "Invalid email or password");

  const user = await getUserById(found.id);
  return { user, ...createTokens(user.id) };
}

export async function refresh(refreshToken: string) {
  let userId: string;
  try {
    userId = verifyRefreshToken(refreshToken).userId;
  } catch {
    throw new AppError(401, "Session expired, please log in again");
  }

  await getUserById(userId); // make sure the user still exists
  return createTokens(userId);
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: publicUser });
  if (!user) throw new AppError(404, "User not found");
  return user;
}