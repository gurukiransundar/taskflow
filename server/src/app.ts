import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "TaskFlow API is running 🚀" });
});

app.get("/api/health/db", async (_req, res) => {
  const users = await prisma.user.count();
  res.json({ status: "ok", database: "connected", users });
});

app.use("/api/auth", authRoutes);

// Unknown routes
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Must be last
app.use(errorHandler);

export default app;