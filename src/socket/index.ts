import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { config } from "../config/env.js";
import { socketAuthMiddleware } from "../middlewares/socketAuth.js";
import { logger } from "../utils/logger.js";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "../types/socket.js";

export type TypedSocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

let io: TypedSocketServer | null = null;

/**
 * Initializes and attaches the Socket.IO server to the HTTP server.
 */
export function initSocketServer(httpServer: HttpServer): TypedSocketServer {
  if (io) {
    return io;
  }

  io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: config.corsOrigin,
      credentials: true,
    },
    // Serve client files at /socket.io/socket.io.js
    serveClient: true,
  });

  // Attach handshake authentication middleware
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    const user = socket.data.user;
    const authMethod = socket.data.authMethod;

    logger.info(
      `[Socket.IO] Client connected: socketId=${socket.id}, user=${user.email} (id=${user.id}, via=${authMethod})`
    );

    // 1. Notify client that handshake and connection succeeded
    socket.emit("connection:success", {
      message: `Welcome, ${user.name}! Authenticated via ${authMethod}.`,
      socketId: socket.id,
      user,
    });

    // 2. Echo event: returns back to the caller
    socket.on("echo", ({ message }) => {
      socket.emit("echo:response", {
        message: String(message ?? ""),
        timestamp: new Date().toISOString(),
      });
    });

    // 3. Broadcast event: emits to all connected sockets
    socket.on("broadcast", ({ message }) => {
      io?.emit("broadcast:message", {
        sender: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        message: String(message ?? ""),
        timestamp: new Date().toISOString(),
      });
    });

    // 4. Room operations: join, leave, and message
    socket.on("room:join", ({ room }) => {
      const trimmedRoom = String(room ?? "").trim();
      if (!trimmedRoom) {
        socket.emit("error", { message: "Room name cannot be empty" });
        return;
      }

      socket.join(trimmedRoom);
      socket.emit("room:joined", {
        room: trimmedRoom,
        message: `Successfully joined room: ${trimmedRoom}`,
      });

      // Notify others in the room
      socket.to(trimmedRoom).emit("system:notification", {
        message: `${user.name} joined room ${trimmedRoom}`,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("room:leave", ({ room }) => {
      const trimmedRoom = String(room ?? "").trim();
      if (!trimmedRoom) return;

      socket.leave(trimmedRoom);
      socket.emit("room:left", {
        room: trimmedRoom,
        message: `Left room: ${trimmedRoom}`,
      });

      socket.to(trimmedRoom).emit("system:notification", {
        message: `${user.name} left room ${trimmedRoom}`,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("room:message", ({ room, message }) => {
      const trimmedRoom = String(room ?? "").trim();
      if (!trimmedRoom) {
        socket.emit("error", { message: "Room name cannot be empty" });
        return;
      }

      io?.to(trimmedRoom).emit("room:message", {
        room: trimmedRoom,
        sender: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        message: String(message ?? ""),
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("disconnect", (reason) => {
      logger.info(
        `[Socket.IO] Client disconnected: socketId=${socket.id}, reason=${reason}`
      );
    });
  });

  return io;
}

/**
 * Returns the initialized Socket.IO server instance.
 * Throws if initSocketServer has not been called yet.
 */
export function getIO(): TypedSocketServer {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized. Call initSocketServer(server) first."
    );
  }
  return io;
}

/**
 * Closes the Socket.IO server and resets singleton instance (useful in tests).
 */
export async function closeSocketServer(): Promise<void> {
  if (io) {
    const serverInstance = io;
    io = null;
    await new Promise<void>((resolve) => {
      serverInstance.close(() => resolve());
    });
  }
}
