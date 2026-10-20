import type { Request, Response } from "express";

export function getUserById(req: Request, res: Response): void {
  const { id } = req.params;
  res.json({ id });
}
