import prisma from "../db/client.js";
import type { Prisma, User } from "../generated/prisma/client.js";
import { logger } from "../utils/logger.js";

export type CreateUserInput = Prisma.UserCreateInput;
export type UpdateUserInput = Prisma.UserUpdateInput;

// ── Repository functions ──────────────────────────────────────────────────────
// All Prisma queries are async — callers must await them.

export async function findAllUsers(): Promise<User[]> {
  logger.debug("UserRepository: finding all users");
  return prisma.user.findMany({ orderBy: { id: "asc" } });
}

export async function findUserById(id: number): Promise<User | null> {
  logger.debug("UserRepository: finding user by id", { userId: id });
  return prisma.user.findUnique({ where: { id } });
}

export async function findUserByEmail(email: string): Promise<User | null> {
  logger.debug("UserRepository: finding user by email", { email });
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(input: CreateUserInput): Promise<User> {
  logger.debug("UserRepository: creating user", { email: input.email });
  return prisma.user.create({ data: input });
}

export async function updateUser(
  id: number,
  input: UpdateUserInput
): Promise<User | null> {
  logger.debug("UserRepository: updating user", { userId: id });
  const existing = await findUserById(id);
  if (!existing) return null;

  return prisma.user.update({ where: { id }, data: input });
}

export async function deleteUser(id: number): Promise<boolean> {
  logger.debug("UserRepository: deleting user", { userId: id });
  // deleteMany doesn't throw when nothing matches — just reports the count
  const result = await prisma.user.deleteMany({ where: { id } });
  return result.count > 0;
}
