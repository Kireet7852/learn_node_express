import type { Request, Response, NextFunction } from "express";

/**
 * Catches unhandled errors thrown in route handlers and returns a 500 response.
 * Must be registered LAST in the middleware chain (4-argument signature required by Express).
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  console.error(err.stack ?? err.message);
  res.status(500).json({ error: "Internal server error" });
}
