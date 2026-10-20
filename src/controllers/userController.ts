import type { Request, Response } from "express";
import * as userService from "../services/userService.js";

// GET /users
export function listUsers(_req: Request, res: Response): void {
  const users = userService.getAllUsers();
  res.json(users);
}

// GET /users/:id
export function getUserById(req: Request, res: Response): void {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "id must be a number" });
    return;
  }

  const user = userService.getUserById(id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
}

// POST /users
export function createUser(req: Request, res: Response): void {
  const { name, email } = req.body as { name?: string; email?: string };

  if (!name || !email) {
    res.status(400).json({ error: "name and email are required" });
    return;
  }

  try {
    const user = userService.createUser({ name, email });
    res.status(201).json(user);
  } catch (err) {
    // Unique constraint on email
    res.status(409).json({ error: "Email already in use" });
  }
}

// PATCH /users/:id
export function updateUser(req: Request, res: Response): void {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "id must be a number" });
    return;
  }

  const { name, email } = req.body as { name?: string; email?: string };
  const user = userService.updateUser(id, { name, email });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
}

// DELETE /users/:id
export function deleteUser(req: Request, res: Response): void {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "id must be a number" });
    return;
  }

  const deleted = userService.deleteUser(id);
  if (!deleted) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.status(204).send();
}

