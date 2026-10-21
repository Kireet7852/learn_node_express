import { randomBytes } from "node:crypto";
import * as sessionRepo from "../repositories/sessionRepository.js";
import type { AuthUser } from "../types/auth.js";

const DEFAULT_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createSession(
  userId: number,
  ttlMs = DEFAULT_SESSION_TTL_MS
): Promise<{ id: string; expiresAt: Date }> {
  // Generate a cryptographically secure 64-hex character token
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + ttlMs);

  await sessionRepo.createSession({
    id,
    userId,
    expiresAt,
  });

  return { id, expiresAt };
}

export async function validateSession(sessionId: string): Promise<AuthUser | null> {
  const session = await sessionRepo.findSessionById(sessionId);
  if (!session) {
    return null;
  }

  // Check expiration
  if (session.expiresAt.getTime() <= Date.now()) {
    // Delete expired session in background
    void sessionRepo.deleteSession(sessionId);
    return null;
  }

  const { user } = session;
  return {
    id: user.id,
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    via: "session",
    createdAt: user.createdAt,
  };
}

export async function revokeSession(sessionId: string): Promise<boolean> {
  return sessionRepo.deleteSession(sessionId);
}

export async function revokeAllUserSessions(userId: number): Promise<number> {
  return sessionRepo.deleteSessionsByUserId(userId);
}
