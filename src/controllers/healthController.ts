import type { Request, Response } from "express";
import { getHealthStatus } from "../services/healthService.js";
import { logger } from "../utils/logger.js";

export function getHealth(_req: Request, res: Response): void {
  logger.debug("Health controller: checking system health");
  const result = getHealthStatus();
  res.json(result);
}
