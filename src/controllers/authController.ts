import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { config } from "../config/env.js";
import * as authService from "../services/authService.js";
import * as sessionService from "../services/sessionService.js";
import * as tokenService from "../services/tokenService.js";
import type { LoginDto, RegisterDto } from "../validators/authValidator.js";
import { logger } from "../utils/logger.js";

// POST /auth/register
export async function register(req: Request, res: Response): Promise<void> {
  const dto = req.body as RegisterDto;

  try {
    const user = await authService.register(dto);
    logger.info("Auth controller: user registration completed", { userId: user.id, email: user.email });
    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      logger.warn("Auth controller: registration failed due to duplicate email", { email: dto.email });
      res.status(409).json({ error: "Email already in use" });
      return;
    }
    throw err;
  }
}

// ── STATEFUL AUTH (Session-based) ─────────────────────────────────────────────

// POST /auth/session/login
export async function sessionLogin(req: Request, res: Response): Promise<void> {
  const dto = req.body as LoginDto;

  const user = await authService.verifyCredentials(dto);
  if (!user) {
    logger.warn("Auth controller: session login rejected (invalid credentials)", { email: dto.email });
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const session = await sessionService.createSession(user.id);
  logger.info("Auth controller: session login successful", { userId: user.id, sessionId: session.id.slice(0, 8) + "..." });

  // Set HTTP-only session cookie
  res.cookie("sid", session.id, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    expires: session.expiresAt,
    path: "/",
  });

  res.json({
    message: "Logged in successfully (stateful session)",
    session: {
      id: session.id,
      expiresAt: session.expiresAt,
    },
    user,
  });
}

// POST /auth/session/logout
export async function sessionLogout(req: Request, res: Response): Promise<void> {
  if (req.sessionId) {
    logger.info("Auth controller: logging out session", { sessionId: req.sessionId.slice(0, 8) + "..." });
    await sessionService.revokeSession(req.sessionId);
  }

  res.clearCookie("sid", { path: "/" });
  res.json({ message: "Logged out successfully" });
}

// GET /auth/session/me
export async function sessionMe(req: Request, res: Response): Promise<void> {
  logger.debug("Auth controller: GET /auth/session/me accessed", { userId: req.user?.id });
  res.json({
    authMethod: "session",
    sessionId: req.sessionId,
    user: req.user,
  });
}

// ── STATELESS AUTH (JWT-based) ────────────────────────────────────────────────

// POST /auth/jwt/login
export async function jwtLogin(req: Request, res: Response): Promise<void> {
  const dto = req.body as LoginDto;

  const user = await authService.verifyCredentials(dto);
  if (!user) {
    logger.warn("Auth controller: JWT login rejected (invalid credentials)", { email: dto.email });
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = await tokenService.generateToken(user, "2h");
  logger.info("Auth controller: JWT login successful", { userId: user.id, email: user.email });

  res.json({
    message: "Logged in successfully (stateless JWT)",
    tokenType: "Bearer",
    token,
    expiresIn: "2h",
    user,
  });
}

// GET /auth/jwt/me
export async function jwtMe(req: Request, res: Response): Promise<void> {
  logger.debug("Auth controller: GET /auth/jwt/me accessed", { userId: req.user?.id });
  res.json({
    authMethod: "jwt",
    user: req.user,
  });
}

// ── COMMON PROTECTED DEMO ROUTES ─────────────────────────────────────────────

// GET /auth/me (accepts either Session or JWT)
export async function getMe(req: Request, res: Response): Promise<void> {
  logger.debug("Auth controller: GET /auth/me accessed", { userId: req.user?.id, authMethod: req.authMethod });
  res.json({
    authMethod: req.authMethod,
    user: req.user,
  });
}

// GET /auth/admin (requires admin role)
export async function adminOnly(req: Request, res: Response): Promise<void> {
  logger.debug("Auth controller: GET /auth/admin accessed", { userId: req.user?.id, role: req.user?.role });
  res.json({
    message: "Welcome to the admin-only area!",
    user: req.user,
  });
}
