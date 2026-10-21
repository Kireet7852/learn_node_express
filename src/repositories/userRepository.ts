import prisma from "../db/client.js";
import type { Prisma, User } from "../generated/prisma/client.js";

export type CreateUserInput = Prisma.UserCreateInput;
export type UpdateUserInput = Prisma.UserUpdateInput;

// ── Repository functions ──────────────────────────────────────────────────────
// All Prisma queries are async — callers must await them.

export async function findAllUsers(): Promise<User[]> {
  return prisma.user.findMany({ orderBy: { id: "asc" } });
}

export async function findUserById(id: number): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(input: CreateUserInput): Promise<User> {
  return prisma.user.create({ data: input });
}

export async function updateUser(
  id: number,
  input: UpdateUserInput
): Promise<User | null> {
  const existing = await findUserById(id);
  if (!existing) return null;

  return prisma.user.update({ where: { id }, data: input });
}

export async function deleteUser(id: number): Promise<boolean> {
  // deleteMany doesn't throw when nothing matches — just reports the count
  const result = await prisma.user.deleteMany({ where: { id } });
  return result.count > 0;
}
