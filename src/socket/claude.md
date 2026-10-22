# Socket

## Purpose
Socket.IO server setup with typed events for real-time communication.

## Key Files
- **index.ts** — Initializes and configures the Socket.IO server. Singleton pattern with `initSocketServer`, `getIO`, and `closeSocketServer`.

## Features
- **Authentication** — All connections require auth via `socketAuthMiddleware` (JWT or session cookie).
- **Echo** — `echo` event returns the message back to the sender.
- **Broadcast** — `broadcast` event sends a message to all connected clients.
- **Rooms** — `room:join`, `room:leave`, `room:message` for channel-based messaging with join/leave notifications.

## Type Safety
The server is fully typed using generics on `Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>`. All event interfaces are defined in `types/socket.ts`.

## Conventions
- Call `initSocketServer(httpServer)` once at startup (in `server.ts`).
- Use `getIO()` to access the instance elsewhere (throws if not initialized).
- Use `closeSocketServer()` for clean shutdown in tests.
- `socket.data.user` contains the authenticated `AuthUser` after handshake.
- `socket.data.authMethod` indicates whether the client authenticated via `jwt` or `session`.
