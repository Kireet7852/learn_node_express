import type { Request, Response } from "express";
import { echo } from "../services/echoService.js";

export function echoBody(req: Request, res: Response): void {
  const result = echo(req.body);
  res.json(result);
}
