import type { NextFunction, Request, Response } from "express";
import * as authService from "../services/authService.js";
import type { AuthUser } from "../types/auth.js";

export type { AuthUser };

/**
 * Authentication middleware (who are you?) — accepts EITHER credential style:
 *
 *  1. STATELESS: "Authorization: Bearer <jwt>"
 *     Verified by signature alone — zero database lookups. Fast, but the
 *     claims (role!) are frozen until the token expires.
 *
 *  2. STATEFUL: `session_token` or `sid` cookie or `X-Session-Id` header
 *     Checked against the sessions table — one query per request, but the
 *     role is always fresh and logout actually works (revocation).
 *
 * Sets req.user on success; responds 401 otherwise.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  // 1. Stateless path — a Bearer JWT takes precedence when present
  if (authHeader?.startsWith("Bearer ")) {
    const payload = await authService.verifyAccessToken(authHeader.slice(7));
    if (!payload) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
    req.user = payload;
    req.authMethod = "jwt";
    next();
    return;
  }

  // 2. Stateful path — session cookie ("sid" or "session_token") or "X-Session-Id" header
  const sessionToken =
    (req.cookies?.[authService.SESSION_COOKIE] as string | undefined) ??
    (req.cookies?.["session_token"] as string | undefined) ??
    (req.headers["x-session-id"] as string | undefined);

  if (sessionToken) {
    const user = await authService.getUserBySessionToken(sessionToken);
    if (!user) {
      res.status(401).json({ error: "Invalid or expired session" });
      return;
    }
    req.user = user;
    req.sessionId = sessionToken;
    req.authMethod = "session";
    next();
    return;
  }

  // 3. No credentials at all
  res.status(401).json({ error: "Authentication required" });
}

/**
 * Authorization middleware (what may you do?) — role gate.
 * Must run AFTER `authenticate` (it reads req.user).
 *
 *   401 = "I don't know who you are"      (handled by authenticate)
 *   403 = "I know you, but you can't"     (handled here)
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: `Requires role: ${roles.join(" or ")}` });
      return;
    }
    next();
  };
}

/**
 * Ownership or Admin authorization middleware factory.
 */
export function requireOwnerOrAdmin(getOwnerId: (req: Request) => number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const ownerId = getOwnerId(req);
    const isOwner = req.user.id === ownerId || req.user.userId === ownerId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        error: "Forbidden",
        details: "You do not have permission to access or modify this resource",
      });
      return;
    }

    next();
  };
}
