import type { Request, Response, NextFunction } from "express";
import * as tokenService from "../services/tokenService.js";

/**
 * Stateless authentication middleware.
 *
 * Inspects the "Authorization: Bearer <token>" header.
 * Validates the JWT cryptographically without hitting the database (stateless).
 */
export async function authenticateJwt(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Unauthorized",
      details: "Missing or malformed Authorization header. Expected 'Bearer <token>'",
    });
    return;
  }

  const token = authHeader.slice(7).trim();
  const user = await tokenService.verifyToken(token);

  if (!user) {
    res.status(401).json({
      error: "Unauthorized",
      details: "Invalid or expired token",
    });
    return;
  }

  req.user = user;
  req.authMethod = "jwt";
  next();
}
