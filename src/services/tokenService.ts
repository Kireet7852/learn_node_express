import { SignJWT, jwtVerify } from "jose";
import { config } from "../config/env.js";
import type { AuthUser } from "../types/auth.js";
import { logger } from "../utils/logger.js";

// Convert the secret string from env into a Uint8Array key for HMAC-SHA256
const secretKey = new TextEncoder().encode(config.jwtSecret);

export async function generateToken(
  user: AuthUser,
  expiresIn = "2h"
): Promise<string> {
  logger.debug("Generating JWT token for user", { userId: user.id, email: user.email, expiresIn });

  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    if (!payload.sub) {
      logger.warn("JWT verification failed: missing subject (sub) claim");
      return null;
    }

    const id = Number(payload.sub);
    if (Number.isNaN(id)) {
      logger.warn("JWT verification failed: subject (sub) is not a valid number", { sub: payload.sub });
      return null;
    }

    logger.debug("JWT token verified successfully", { userId: id, email: payload["email"] });

    return {
      id,
      userId: id,
      name: String(payload["name"] ?? ""),
      email: String(payload["email"] ?? ""),
      role: String(payload["role"] ?? "user"),
      via: "jwt",
      createdAt: new Date(),
    };
  } catch (err) {
    // Expired, invalid signature, or malformed token
    logger.debug("JWT verification failed", { error: err instanceof Error ? err.message : String(err) });
    return null;
  }
}
