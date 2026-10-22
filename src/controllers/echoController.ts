import type { Request, Response } from "express";
import { echo } from "../services/echoService.js";
import { logger } from "../utils/logger.js";

export function echoBody(req: Request, res: Response): void {
  logger.debug("Echo controller: echoing request body");
  const result = echo(req.body);
  res.json(result);
}
