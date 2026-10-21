import { SignJWT, jwtVerify } from "jose";
import { config } from "../config/env.js";
import type { AuthUser } from "../types/auth.js";

// Convert the secret string from env into a Uint8Array key for HMAC-SHA256
const secretKey = new TextEncoder().encode(config.jwtSecret);

export async function generateToken(
  user: AuthUser,
  expiresIn = "2h"
): Promise<string> {
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
      return null;
    }

    const id = Number(payload.sub);
    if (Number.isNaN(id)) {
      return null;
    }

    return {
      id,
      userId: id,
      name: String(payload["name"] ?? ""),
      email: String(payload["email"] ?? ""),
      role: String(payload["role"] ?? "user"),
      via: "jwt",
      createdAt: new Date(),
    };
  } catch {
    // Expired, invalid signature, or malformed token
    return null;
  }
}
