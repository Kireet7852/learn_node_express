import prisma from "../db/client.js";
import type { Session, User } from "../generated/prisma/client.js";

export interface SessionWithUser extends Session {
  user: User;
}

export async function createSession(data: {
  id: string;
  userId: number;
  expiresAt: Date;
}): Promise<Session> {
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
  return prisma.session.findUnique({
    where: { id },
    include: { user: true },
  });
}

export async function deleteSession(id: string): Promise<boolean> {
  const result = await prisma.session.deleteMany({
    where: { id },
  });
  return result.count > 0;
}

export async function deleteSessionsByUserId(userId: number): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: { userId },
  });
  return result.count;
}

export async function deleteExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
  return result.count;
}
