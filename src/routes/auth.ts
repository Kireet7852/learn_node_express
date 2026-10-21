import { Router } from "express";
import {
  register,
  sessionLogin,
  sessionLogout,
  sessionMe,
  jwtLogin,
  jwtMe,
  getMe,
  adminOnly,
} from "../controllers/authController.js";
import { validateBody } from "../middlewares/validate.js";
import { authenticateSession } from "../middlewares/authenticateSession.js";
import { authenticateJwt } from "../middlewares/authenticateJwt.js";
import { authenticate } from "../middlewares/authenticate.js";
import { requireRole } from "../middlewares/authorize.js";
import { loginSchema, registerSchema } from "../validators/authValidator.js";

const router = Router();

// ── Registration ─────────────────────────────────────────────────────────────
router.post("/register", validateBody(registerSchema), register);

// ── Stateful Authentication (Database Sessions + Cookies / X-Session-Id) ─────
router.post("/session/login", validateBody(loginSchema), sessionLogin);
router.post("/session/logout", authenticateSession, sessionLogout);
router.get("/session/me", authenticateSession, sessionMe);

// ── Stateless Authentication (Cryptographic JWT Bearer Tokens) ───────────────
router.post("/jwt/login", validateBody(loginSchema), jwtLogin);
router.get("/jwt/me", authenticateJwt, jwtMe);

// ── Unified Authentication (Accepts either JWT or Session) ───────────────────
router.get("/me", authenticate, getMe);

// ── Role-Based Authorization Example (Requires 'admin' role) ─────────────────
router.get("/admin", authenticate, requireRole("admin"), adminOnly);

export default router;
