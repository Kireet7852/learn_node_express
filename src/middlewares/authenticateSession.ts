import type { Request, Response, NextFunction } from "express";
import * as sessionService from "../services/sessionService.js";

/**
 * Stateful authentication middleware.
 *
 * Inspects incoming requests for a session token:
 * 1. An HTTP-only cookie named "sid" (primary for browser clients)
 * 2. An "X-Session-Id" header (convenient for API clients / testing)
 *
 * Checks session existence and expiry in the database (stateful).
 */
export async function authenticateSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const sessionId =
    (req.cookies?.["sid"] as string | undefined) ??
    (req.headers["x-session-id"] as string | undefined);

  if (!sessionId) {
    res.status(401).json({
      error: "Unauthorized",
      details: "Missing session cookie (sid) or X-Session-Id header",
    });
    return;
  }

  const user = await sessionService.validateSession(sessionId);
  if (!user) {
    res.status(401).json({
      error: "Unauthorized",
      details: "Invalid or expired session",
    });
    return;
  }

  req.user = user;
  req.sessionId = sessionId;
  req.authMethod = "session";
  next();
}
