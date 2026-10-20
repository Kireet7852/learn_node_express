import type { Request, Response } from "express";
import { findUserById } from "../services/userService.js";

export function getUserById(req: Request, res: Response): void {
  const { id } = req.params;
  const user = findUserById(String(id));
  res.json(user);
}
