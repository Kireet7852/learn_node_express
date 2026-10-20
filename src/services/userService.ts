import type { User, CreateUserInput } from "../db/schema.js";
import * as userRepo from "../repositories/userRepository.js";

export function getAllUsers(): User[] {
  return userRepo.findAllUsers();
}

export function getUserById(id: number): User | null {
  return userRepo.findUserById(id);
}

export function createUser(input: CreateUserInput): User {
  return userRepo.createUser(input);
}

export function updateUser(
  id: number,
  input: Partial<CreateUserInput>
): User | null {
  return userRepo.updateUser(id, input);
}

export function deleteUser(id: number): boolean {
  return userRepo.deleteUser(id);
}

