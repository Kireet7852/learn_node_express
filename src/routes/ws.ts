import { Router } from "express";
import { getWsDemo } from "../controllers/wsDemoController.js";
import { getIO } from "../socket/index.js";

const router = Router();

// ── Interactive HTML playground ─────────────────────────────────────────────
router.get("/demo", getWsDemo);

// ── WebSocket metadata and status endpoint ──────────────────────────────────
router.get("/info", (_req, res) => {
  try {
    const io = getIO();
    const sockets = io.sockets.sockets;
    const connectedCount = sockets.size;

    res.json({
      status: "online",
      engine: "socket.io",
      connectedClients: connectedCount,
      transports: ["websocket", "polling"],
      authMethods: [
        {
          type: "stateless",
          method: "JWT Bearer",
          handshakeField: "auth.token or Authorization: Bearer <token>",
        },
        {
          type: "stateful",
          method: "Database Session",
          handshakeField: "auth.sessionId, X-Session-Id header, or 'sid' cookie",
        },
      ],
      events: {
        clientToServer: [
          "echo",
          "broadcast",
          "room:join",
          "room:leave",
          "room:message",
        ],
        serverToClient: [
          "connection:success",
          "echo:response",
          "broadcast:message",
          "room:joined",
          "room:left",
          "room:message",
          "system:notification",
          "error",
        ],
      },
    });
  } catch {
    res.json({
      status: "uninitialized",
      engine: "socket.io",
      connectedClients: 0,
    });
  }
});

export default router;
