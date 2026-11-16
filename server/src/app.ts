import express from "express";
import cors from "cors";
import { prisma } from "./config/prisma.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "TaskFlow API is running 🚀" });
});

app.get("/api/health/db", async (_req, res) => {
  const users = await prisma.user.count();
  res.json({ status: "ok", database: "connected", users });
});

export default app;