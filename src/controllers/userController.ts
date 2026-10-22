import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import type { CreateUserDto, UpdateUserDto } from "../validators/userValidator.js";
import * as userService from "../services/userService.js";
import { logger } from "../utils/logger.js";

// GET /users
export async function listUsers(_req: Request, res: Response): Promise<void> {
  logger.debug("User controller: listing all users");
  const users = await userService.getAllUsers();
  res.json(users);
}

// GET /users/:id
// :id is already validated by validateParams(userIdParamSchema) — a positive integer
export async function getUserById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params["id"]);
  logger.debug("User controller: fetching user by id", { userId: id });

  const user = await userService.getUserById(id);
  if (!user) {
    logger.warn("User controller: user not found", { userId: id });
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
}

// POST /users
// Body is already validated + normalized by validateBody(createUserSchema)
export async function createUser(req: Request, res: Response): Promise<void> {
  const { name, email } = req.body as CreateUserDto;
  logger.info("User controller: creating user", { email });

  try {
    const user = await userService.createUser({ name, email });
    logger.info("User controller: user created", { userId: user.id, email: user.email });
    res.status(201).json(user);
  } catch (err) {
    // Unique constraint on email (Prisma error code P2002)
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      logger.warn("User controller: create user failed due to duplicate email", { email });
      res.status(409).json({ error: "Email already in use" });
      return;
    }
    throw err; // Express 5 forwards async errors to errorHandler
  }
}

// PATCH /users/:id
// Body is already validated by validateBody(updateUserSchema) — guaranteed to
// carry at least one of name/email, non-empty and correctly formatted.
// :id is already validated by validateParams(userIdParamSchema).
export async function updateUser(req: Request, res: Response): Promise<void> {
  const id = Number(req.params["id"]);
  const { name, email } = req.body as UpdateUserDto;
  logger.info("User controller: updating user", { userId: id });

  const user = await userService.updateUser(id, { name, email });

  if (!user) {
    logger.warn("User controller: user not found for update", { userId: id });
    res.status(404).json({ error: "User not found" });
    return;
  }

  logger.info("User controller: user updated successfully", { userId: id });
  res.json(user);
}

// DELETE /users/:id
// :id is already validated by validateParams(userIdParamSchema)
export async function deleteUser(req: Request, res: Response): Promise<void> {
  const id = Number(req.params["id"]);
  logger.info("User controller: deleting user", { userId: id });

  const deleted = await userService.deleteUser(id);
  if (!deleted) {
    logger.warn("User controller: user not found for deletion", { userId: id });
    res.status(404).json({ error: "User not found" });
    return;
  }

  logger.info("User controller: user deleted successfully", { userId: id });
  res.status(204).send();
}
