import type { User } from "../generated/prisma/client.js";
import * as userRepo from "../repositories/userRepository.js";

export async function getAllUsers(): Promise<User[]> {
  return userRepo.findAllUsers();
}

export async function getUserById(id: number): Promise<User | null> {
  return userRepo.findUserById(id);
}

export async function createUser(input: userRepo.CreateUserInput): Promise<User> {
  return userRepo.createUser(input);
}

export async function updateUser(
  id: number,
  input: userRepo.UpdateUserInput
): Promise<User | null> {
  return userRepo.updateUser(id, input);
}

export async function deleteUser(id: number): Promise<boolean> {
  return userRepo.deleteUser(id);
}
