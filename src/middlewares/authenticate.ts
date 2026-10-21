import type { Request, Response, NextFunction } from "express";
import * as tokenService from "../services/tokenService.js";
import * as sessionService from "../services/sessionService.js";

/**
 * Flexible / Dual authentication middleware.
 *
 * Supports BOTH authentication models on the same endpoint:
 * 1. Checks for "Authorization: Bearer <jwt>" first (stateless).
 * 2. If absent, checks for session cookie "sid" or "X-Session-Id" (stateful).
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  // 1. Try stateless JWT if Bearer header is present
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    const user = await tokenService.verifyToken(token);

    if (user) {
      req.user = user;
      req.authMethod = "jwt";
      return next();
    }

    res.status(401).json({
      error: "Unauthorized",
      details: "Invalid or expired JWT token",
    });
    return;
  }

  // 2. Try stateful session if cookie or header is present
  const sessionId =
    (req.cookies?.["sid"] as string | undefined) ??
    (req.headers["x-session-id"] as string | undefined);

  if (sessionId) {
    const user = await sessionService.validateSession(sessionId);

    if (user) {
      req.user = user;
      req.sessionId = sessionId;
      req.authMethod = "session";
      return next();
    }

    res.status(401).json({
      error: "Unauthorized",
      details: "Invalid or expired session",
    });
    return;
  }

  // Neither provided
  res.status(401).json({
    error: "Unauthorized",
    details: "Authentication required. Provide a Bearer token or a session cookie",
  });
}
