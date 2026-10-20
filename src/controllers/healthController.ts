import type { Request, Response } from "express";
import { getHealthStatus } from "../services/healthService.js";

export function getHealth(_req: Request, res: Response): void {
  const result = getHealthStatus();
  res.json(result);
}
