import * as userRepo from "../repositories/userRepository.js";
import type { AuthUser } from "../types/auth.js";
import { sanitizeUser } from "./authService.js";
import { logger } from "../utils/logger.js";

export async function getAllUsers(): Promise<AuthUser[]> {
  logger.debug("Fetching all users from repository");
  const users = await userRepo.findAllUsers();
  return users.map((u) => sanitizeUser(u));
}

export async function getUserById(id: number): Promise<AuthUser | null> {
  logger.debug("Fetching user by id", { userId: id });
  const user = await userRepo.findUserById(id);
  return user ? sanitizeUser(user) : null;
}

export async function createUser(input: userRepo.CreateUserInput): Promise<AuthUser> {
  logger.info("Creating user in repository", { email: input.email });
  const user = await userRepo.createUser(input);
  return sanitizeUser(user);
}

export async function updateUser(
  id: number,
  input: userRepo.UpdateUserInput
): Promise<AuthUser | null> {
  logger.info("Updating user in repository", { userId: id });
  const user = await userRepo.updateUser(id, input);
  return user ? sanitizeUser(user) : null;
}

export async function deleteUser(id: number): Promise<boolean> {
  logger.info("Deleting user from repository", { userId: id });
  return userRepo.deleteUser(id);
}
