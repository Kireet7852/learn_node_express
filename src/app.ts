import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/env.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import rootRouter from "./routes/index.js";

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
// Allowed origins come from CORS_ORIGIN in .env (string or comma-separated list)
app.use(cors({ origin: config.corsOrigin }));

// ── Body & Cookie parsers ────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Request logging ───────────────────────────────────────────────────────────
app.use(requestLogger);

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/", rootRouter);

// ── Fallback handlers (must be last) ─────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
