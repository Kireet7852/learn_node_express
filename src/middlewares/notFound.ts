import type { Request, Response } from "express";

/**
 * Handles unmatched routes with a 404 JSON response.
 */
export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: "Not found" });
}
