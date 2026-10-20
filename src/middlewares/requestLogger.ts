import type { Request, Response, NextFunction } from "express";

/**
 * Logs method and URL for every incoming request.
 */
export function requestLogger(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}
