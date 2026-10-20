import express from "express";
import { requestLogger } from "./middlewares/requestLogger.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import rootRouter from "./routes/index.js";

const app = express();

// ── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request logging ───────────────────────────────────────────────────────────
app.use(requestLogger);

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/", rootRouter);

// ── Fallback handlers (must be last) ─────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
