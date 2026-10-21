import type { User } from "../generated/prisma/client.js";
import * as userRepo from "../repositories/userRepository.js";
import * as sessionService from "./sessionService.js";
import * as tokenService from "./tokenService.js";
import type { AuthUser } from "../types/auth.js";
import type { LoginDto, RegisterDto } from "../validators/authValidator.js";

export const SESSION_COOKIE = "sid";

/**
 * Strips sensitive fields like passwordHash from the user object.
 */
export function sanitizeUser(
  user: User,
  via: "jwt" | "session" = "jwt"
): AuthUser {
  return {
    id: user.id,
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    via,
    createdAt: user.createdAt,
  };
}

/**
 * Registers a new user with an Argon2id password hash.
 */
export async function register(dto: RegisterDto): Promise<AuthUser> {
  const passwordHash = await Bun.password.hash(dto.password, {
    algorithm: "argon2id",
    memoryCost: 65536,
    timeCost: 2,
  });

  const user = await userRepo.createUser({
    name: dto.name,
    email: dto.email,
    passwordHash,
    role: dto.role ?? "user",
  });

  return sanitizeUser(user, "session");
}

/**
 * Verifies email and password credentials.
 * Returns the sanitized user on success, or null on invalid credentials.
 */
export async function verifyCredentials(
  dto: LoginDto
): Promise<AuthUser | null> {
  const user = await userRepo.findUserByEmail(dto.email);
  if (!user || !user.passwordHash) {
    return null;
  }

  const isValid = await Bun.password.verify(dto.password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return sanitizeUser(user);
}

/**
 * Verifies a JWT access token (stateless auth).
 */
export async function verifyAccessToken(
  token: string
): Promise<AuthUser | null> {
  return tokenService.verifyToken(token);
}

/**
 * Retrieves the user for an active session token (stateful auth).
 */
export async function getUserBySessionToken(
  sessionToken: string
): Promise<AuthUser | null> {
  return sessionService.validateSession(sessionToken);
}
