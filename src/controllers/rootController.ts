import type { Request, Response } from "express";

export function getRoot(_req: Request, res: Response): void {
  res.json({ message: "Hello from Express + Bun + TypeScript!" });
}
