import type { JWTPayload } from "jose";

export type UserRole = "user" | "admin" | (string & {});

export interface AuthUser {
  id: number;
  userId: number;
  name: string;
  email: string;
  role: string;
  via: "jwt" | "session";
  createdAt?: Date;
}

export interface AuthTokenPayload extends JWTPayload {
  sub: string;
  userId: number;
  email: string;
  name: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      sessionId?: string;
      authMethod?: "session" | "jwt";
    }
  }
}
