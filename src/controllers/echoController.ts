import type { Request, Response } from "express";

export function echoBody(req: Request, res: Response): void {
  res.json({ youSent: req.body });
}
