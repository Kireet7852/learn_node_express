import prisma from "../db/client.js";
import type { Session, User } from "../generated/prisma/client.js";
import { logger } from "../utils/logger.js";

export interface SessionWithUser extends Session {
  user: User;
}

export async function createSession(data: {
  id: string;
  userId: number;
  expiresAt: Date;
}): Promise<Session> {
  logger.debug("SessionRepository: creating session record", { userId: data.userId });
  return prisma.session.create({
    data: {
      id: data.id,
      userId: data.userId,
      expiresAt: data.expiresAt,
    },
  });
}

export async function findSessionById(
  id: string
): Promise<SessionWithUser | null> {
  logger.debug("SessionRepository: finding session by id", { sessionId: id.slice(0, 8) + "..." });
  return prisma.session.findUnique({
    where: { id },
    include: { user: true },
  });
}

export async function deleteSession(id: string): Promise<boolean> {
  logger.debug("SessionRepository: deleting session record", { sessionId: id.slice(0, 8) + "..." });
  const result = await prisma.session.deleteMany({
    where: { id },
  });
  return result.count > 0;
}

export async function deleteSessionsByUserId(userId: number): Promise<number> {
  logger.debug("SessionRepository: deleting all sessions for user", { userId });
  const result = await prisma.session.deleteMany({
    where: { userId },
  });
  return result.count;
}

export async function deleteExpiredSessions(): Promise<number> {
  logger.debug("SessionRepository: cleaning up expired sessions");
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
  return result.count;
}
