import type { Request, Response } from "express";
import { logger } from "../utils/logger.js";

/**
 * Handles unmatched routes with a 404 JSON response.
 */
export function notFound(req: Request, res: Response): void {
  logger.warn("Route not found", {
    method: req.method,
    url: req.originalUrl || req.url,
  });
  res.status(404).json({ error: "Not found" });
}
