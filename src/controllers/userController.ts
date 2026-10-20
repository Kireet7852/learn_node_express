import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import * as userService from "../services/userService.js";

// GET /users
export async function listUsers(_req: Request, res: Response): Promise<void> {
  const users = await userService.getAllUsers();
  res.json(users);
}

// GET /users/:id
export async function getUserById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "id must be a number" });
    return;
  }

  const user = await userService.getUserById(id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
}

// POST /users
export async function createUser(req: Request, res: Response): Promise<void> {
  const { name, email } = req.body as { name?: string; email?: string };

  if (!name || !email) {
    res.status(400).json({ error: "name and email are required" });
    return;
  }

  try {
    const user = await userService.createUser({ name, email });
    res.status(201).json(user);
  } catch (err) {
    // Unique constraint on email (Prisma error code P2002)
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      res.status(409).json({ error: "Email already in use" });
      return;
    }
    throw err; // Express 5 forwards async errors to errorHandler
  }
}

// PATCH /users/:id
export async function updateUser(req: Request, res: Response): Promise<void> {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "id must be a number" });
    return;
  }

  const { name, email } = req.body as { name?: string; email?: string };
  const user = await userService.updateUser(id, { name, email });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
}

// DELETE /users/:id
export async function deleteUser(req: Request, res: Response): Promise<void> {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "id must be a number" });
    return;
  }

  const deleted = await userService.deleteUser(id);
  if (!deleted) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.status(204).send();
}

