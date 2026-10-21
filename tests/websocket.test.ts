import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import http from "node:http";
import { io as Client, type Socket as ClientSocket } from "socket.io-client";
import app from "../src/app.js";
import prisma from "../src/db/client.js";
import { initSocketServer, closeSocketServer } from "../src/socket/index.js";
import * as authService from "../src/services/authService.js";
import * as tokenService from "../src/services/tokenService.js";
import * as sessionService from "../src/services/sessionService.js";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../src/types/socket.js";

type TestClientSocket = ClientSocket<ServerToClientEvents, ClientToServerEvents>;

let server: http.Server;
let wsUrl: string;
let baseUrl: string;

let jwtUser: {
  user: { id: number; name: string; email: string; role: string };
  token: string;
};

let sessionUser: {
  user: { id: number; name: string; email: string; role: string };
  sessionId: string;
};

let thirdUser: {
  user: { id: number; name: string; email: string; role: string };
  token: string;
};

beforeAll(async () => {
  // Start server and initialize Socket.IO
  server = http.createServer(app);
  initSocketServer(server);

  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === "object") {
        baseUrl = `http://127.0.0.1:${addr.port}`;
        wsUrl = `http://127.0.0.1:${addr.port}`;
      }
      resolve();
    });
  });

  // Seed test users
  const timestamp = Date.now();

  // User 1 for JWT tests
  const u1 = await authService.register({
    name: "Socket JWT User",
    email: `socket_jwt_${timestamp}@example.com`,
    password: "Password123!",
    role: "user",
  });
  const token = await tokenService.generateToken({
    id: u1.id,
    userId: u1.id,
    name: u1.name,
    email: u1.email,
    role: u1.role,
    via: "jwt",
  });
  jwtUser = { user: u1, token };

  // User 2 for Session tests
  const u2 = await authService.register({
    name: "Socket Session User",
    email: `socket_session_${timestamp}@example.com`,
    password: "Password123!",
    role: "user",
  });
  const session = await sessionService.createSession(u2.id);
  sessionUser = { user: u2, sessionId: session.id };

  // User 3 for multi-client / room isolation tests
  const u3 = await authService.register({
    name: "Socket Room User",
    email: `socket_room_${timestamp}@example.com`,
    password: "Password123!",
    role: "user",
  });
  const token3 = await tokenService.generateToken({
    id: u3.id,
    userId: u3.id,
    name: u3.name,
    email: u3.email,
    role: u3.role,
    via: "jwt",
  });
  thirdUser = { user: u3, token: token3 };
});

afterAll(async () => {
  await closeSocketServer();
  await prisma.$disconnect();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

function createClient(options: Record<string, any>): TestClientSocket {
  return Client(wsUrl, {
    transports: ["websocket"],
    forceNew: true,
    reconnection: false,
    autoConnect: false,
    ...options,
  }) as TestClientSocket;
}

describe("Socket.IO Handshake Authentication", () => {
  it("should reject connection when no authentication is provided", async () => {
    const socket = createClient({});

    const err = await new Promise<Error>((resolve) => {
      socket.on("connect_error", (err) => resolve(err));
      socket.connect();
    });

    expect(err.message).toContain("Authentication required");
    socket.disconnect();
  });

  it("should reject connection with invalid/tampered JWT", async () => {
    const socket = createClient({
      auth: { token: "invalid.jwt.token" },
    });

    const err = await new Promise<Error>((resolve) => {
      socket.on("connect_error", (err) => resolve(err));
      socket.connect();
    });

    expect(err.message).toContain("Invalid or expired JWT token");
    socket.disconnect();
  });

  it("should reject connection with non-existent session ID", async () => {
    const socket = createClient({
      auth: { sessionId: "0123456789abcdef0123456789abcdef" },
    });

    const err = await new Promise<Error>((resolve) => {
      socket.on("connect_error", (err) => resolve(err));
      socket.connect();
    });

    expect(err.message).toContain("Invalid or expired session");
    socket.disconnect();
  });

  it("should connect successfully using JWT in auth.token", async () => {
    const socket = createClient({
      auth: { token: jwtUser.token },
    });

    const welcomeData = await new Promise<any>((resolve, reject) => {
      socket.on("connection:success", (data) => resolve(data));
      socket.on("connect_error", (err) => reject(err));
      socket.connect();
    });

    expect(welcomeData.user.id).toBe(jwtUser.user.id);
    expect(welcomeData.user.via).toBe("jwt");
    expect(welcomeData.message).toContain("Authenticated via jwt");
    socket.disconnect();
  });

  it("should connect successfully using Authorization Bearer header", async () => {
    const socket = createClient({
      extraHeaders: {
        authorization: `Bearer ${jwtUser.token}`,
      },
    });

    const welcomeData = await new Promise<any>((resolve, reject) => {
      socket.on("connection:success", (data) => resolve(data));
      socket.on("connect_error", (err) => reject(err));
      socket.connect();
    });

    expect(welcomeData.user.id).toBe(jwtUser.user.id);
    expect(welcomeData.user.via).toBe("jwt");
    socket.disconnect();
  });

  it("should connect successfully using Session ID in auth.sessionId", async () => {
    const socket = createClient({
      auth: { sessionId: sessionUser.sessionId },
    });

    const welcomeData = await new Promise<any>((resolve, reject) => {
      socket.on("connection:success", (data) => resolve(data));
      socket.on("connect_error", (err) => reject(err));
      socket.connect();
    });

    expect(welcomeData.user.id).toBe(sessionUser.user.id);
    expect(welcomeData.user.via).toBe("session");
    expect(welcomeData.message).toContain("Authenticated via session");
    socket.disconnect();
  });

  it("should connect successfully using session cookie sid", async () => {
    const socket = createClient({
      extraHeaders: {
        cookie: `sid=${sessionUser.sessionId}; other=test`,
      },
    });

    const welcomeData = await new Promise<any>((resolve, reject) => {
      socket.on("connection:success", (data) => resolve(data));
      socket.on("connect_error", (err) => reject(err));
      socket.connect();
    });

    expect(welcomeData.user.id).toBe(sessionUser.user.id);
    expect(welcomeData.user.via).toBe("session");
    socket.disconnect();
  });
});

describe("Socket.IO Real-Time Messaging", () => {
  it("should handle echo event and respond with echo:response", async () => {
    const socket = createClient({
      auth: { token: jwtUser.token },
    });

    await new Promise<void>((resolve, reject) => {
      socket.on("connect", () => resolve());
      socket.on("connect_error", (err) => reject(err));
      socket.connect();
    });

    const echoPromise = new Promise<{ message: string; timestamp: string }>(
      (resolve) => {
        socket.on("echo:response", (data) => resolve(data));
      }
    );

    socket.emit("echo", { message: "Test Echo Message" });
    const response = await echoPromise;

    expect(response.message).toBe("Test Echo Message");
    expect(new Date(response.timestamp).getTime()).toBeGreaterThan(0);
    socket.disconnect();
  });

  it("should broadcast message to all connected clients", async () => {
    const client1 = createClient({ auth: { token: jwtUser.token } });
    const client2 = createClient({ auth: { sessionId: sessionUser.sessionId } });

    await Promise.all([
      new Promise<void>((res) => {
        client1.on("connect", () => res());
        client1.connect();
      }),
      new Promise<void>((res) => {
        client2.on("connect", () => res());
        client2.connect();
      }),
    ]);

    const broadcastPromise1 = new Promise<any>((resolve) => {
      client1.on("broadcast:message", (data) => resolve(data));
    });
    const broadcastPromise2 = new Promise<any>((resolve) => {
      client2.on("broadcast:message", (data) => resolve(data));
    });

    client1.emit("broadcast", { message: "Global Announcement!" });

    const [data1, data2] = await Promise.all([broadcastPromise1, broadcastPromise2]);

    expect(data1.message).toBe("Global Announcement!");
    expect(data1.sender.id).toBe(jwtUser.user.id);
    expect(data2.message).toBe("Global Announcement!");
    expect(data2.sender.id).toBe(jwtUser.user.id);

    client1.disconnect();
    client2.disconnect();
  });

  it("should join room and isolate messages to room members", async () => {
    const member1 = createClient({ auth: { token: jwtUser.token } });
    const member2 = createClient({ auth: { sessionId: sessionUser.sessionId } });
    const nonMember = createClient({ auth: { token: thirdUser.token } });

    await Promise.all([
      new Promise<void>((res) => {
        member1.on("connect", () => res());
        member1.connect();
      }),
      new Promise<void>((res) => {
        member2.on("connect", () => res());
        member2.connect();
      }),
      new Promise<void>((res) => {
        nonMember.on("connect", () => res());
        nonMember.connect();
      }),
    ]);

    // Member 1 joins "secret-room"
    const join1Promise = new Promise<any>((resolve) => {
      member1.on("room:joined", (data) => resolve(data));
    });
    member1.emit("room:join", { room: "secret-room" });
    const joinResult = await join1Promise;
    expect(joinResult.room).toBe("secret-room");

    // Member 2 joins "secret-room" and member 1 receives system notification
    const notificationPromise = new Promise<any>((resolve) => {
      member1.on("system:notification", (data) => resolve(data));
    });
    member2.emit("room:join", { room: "secret-room" });
    const notif = await notificationPromise;
    expect(notif.message).toContain("joined room secret-room");

    // Member 1 sends room message
    const member2RoomMsgPromise = new Promise<any>((resolve) => {
      member2.on("room:message", (data) => resolve(data));
    });

    let nonMemberReceived = false;
    nonMember.on("room:message", () => {
      nonMemberReceived = true;
    });

    member1.emit("room:message", {
      room: "secret-room",
      message: "Secret meeting in progress",
    });

    const roomMsg = await member2RoomMsgPromise;
    expect(roomMsg.room).toBe("secret-room");
    expect(roomMsg.message).toBe("Secret meeting in progress");
    expect(roomMsg.sender.id).toBe(jwtUser.user.id);

    // Give a short grace period to verify nonMember did not receive it
    await new Promise((r) => setTimeout(r, 50));
    expect(nonMemberReceived).toBe(false);

    member1.disconnect();
    member2.disconnect();
    nonMember.disconnect();
  });
});

describe("WebSocket HTTP Endpoints", () => {
  it("should return websocket status and metadata from GET /ws/info", async () => {
    const res = await fetch(`${baseUrl}/ws/info`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.status).toBe("online");
    expect(data.engine).toBe("socket.io");
    expect(Array.isArray(data.authMethods)).toBe(true);
    expect(data.events.clientToServer).toContain("echo");
    expect(data.events.clientToServer).toContain("broadcast");
  });

  it("should serve HTML demo playground on GET /ws-demo", async () => {
    const res = await fetch(`${baseUrl}/ws-demo`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("Socket.IO Authenticated WebSocket Playground");
    expect(text).toContain("/socket.io/socket.io.js");
  });
});
