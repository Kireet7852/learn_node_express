import type { Socket } from "socket.io";
import * as tokenService from "../services/tokenService.js";
import * as sessionService from "../services/sessionService.js";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "../types/socket.js";

type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

/**
 * Parses raw cookie strings (from socket.handshake.headers.cookie) into key-value pairs.
 */
function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }
  const cookies: Record<string, string> = {};
  for (const pair of cookieHeader.split(";")) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const [rawName, ...rest] = trimmed.split("=");
    if (rawName) {
      cookies[rawName] = decodeURIComponent(rest.join("="));
    }
  }
  return cookies;
}

/**
 * Socket.IO authentication middleware.
 *
 * Supports dual stateful (Session) and stateless (JWT) authentication during handshake:
 *
 * 1. Stateless (JWT):
 *    - socket.handshake.auth.token
 *    - Authorization: Bearer <token> in headers
 *    - ?token=<token> in query
 *
 * 2. Stateful (Session):
 *    - socket.handshake.auth.sessionId
 *    - X-Session-Id in headers
 *    - Cookie "sid" in headers.cookie
 *    - ?sessionId=<sessionId> in query
 */
export async function socketAuthMiddleware(
  socket: TypedSocket,
  next: (err?: Error) => void
): Promise<void> {
  try {
    const auth = socket.handshake.auth ?? {};
    const headers = socket.handshake.headers;
    const query = socket.handshake.query;

    // ── 1. Check for JWT ───────────────────────────────────────────────────────
    let jwtToken: string | undefined;

    if (typeof auth["token"] === "string" && auth["token"].trim()) {
      jwtToken = auth["token"].trim();
      if (jwtToken.startsWith("Bearer ")) {
        jwtToken = jwtToken.slice(7).trim();
      }
    } else if (
      typeof headers.authorization === "string" &&
      headers.authorization.startsWith("Bearer ")
    ) {
      jwtToken = headers.authorization.slice(7).trim();
    } else if (typeof query["token"] === "string" && query["token"].trim()) {
      jwtToken = query["token"].trim();
      if (jwtToken.startsWith("Bearer ")) {
        jwtToken = jwtToken.slice(7).trim();
      }
    }

    if (jwtToken) {
      const user = await tokenService.verifyToken(jwtToken);
      if (!user) {
        return next(new Error("Unauthorized: Invalid or expired JWT token"));
      }

      socket.data.user = user;
      socket.data.authMethod = "jwt";
      return next();
    }

    // ── 2. Check for Session ID ────────────────────────────────────────────────
    let sessionId: string | undefined;

    if (typeof auth["sessionId"] === "string" && auth["sessionId"].trim()) {
      sessionId = auth["sessionId"].trim();
    } else if (
      typeof headers["x-session-id"] === "string" &&
      headers["x-session-id"].trim()
    ) {
      sessionId = headers["x-session-id"].trim();
    } else if (
      typeof query["sessionId"] === "string" &&
      query["sessionId"].trim()
    ) {
      sessionId = query["sessionId"].trim();
    } else {
      const cookies = parseCookies(headers.cookie);
      if (cookies["sid"]) {
        sessionId = cookies["sid"];
      }
    }

    if (sessionId) {
      const user = await sessionService.validateSession(sessionId);
      if (!user) {
        return next(new Error("Unauthorized: Invalid or expired session"));
      }

      socket.data.user = user;
      socket.data.sessionId = sessionId;
      socket.data.authMethod = "session";
      return next();
    }

    // ── 3. Neither provided ────────────────────────────────────────────────────
    return next(
      new Error(
        "Unauthorized: Authentication required. Provide a valid JWT token or session cookie/ID."
      )
    );
  } catch (error) {
    return next(
      error instanceof Error
        ? error
        : new Error("Authentication error occurred during WebSocket handshake")
    );
  }
}
