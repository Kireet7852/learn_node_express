import * as userRepo from "../repositories/userRepository.js";
import type { AuthUser } from "../types/auth.js";
import { sanitizeUser } from "./authService.js";

export async function getAllUsers(): Promise<AuthUser[]> {
  const users = await userRepo.findAllUsers();
  return users.map((u) => sanitizeUser(u));
}

export async function getUserById(id: number): Promise<AuthUser | null> {
  const user = await userRepo.findUserById(id);
  return user ? sanitizeUser(user) : null;
}

export async function createUser(input: userRepo.CreateUserInput): Promise<AuthUser> {
  const user = await userRepo.createUser(input);
  return sanitizeUser(user);
}

export async function updateUser(
  id: number,
  input: userRepo.UpdateUserInput
): Promise<AuthUser | null> {
  const user = await userRepo.updateUser(id, input);
  return user ? sanitizeUser(user) : null;
}

export async function deleteUser(id: number): Promise<boolean> {
  return userRepo.deleteUser(id);
}
