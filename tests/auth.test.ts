import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import type { Server } from "node:http";
import app from "../src/app.js";
import prisma from "../src/db/client.js";

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === "object") {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
      resolve();
    });
  });
});

afterAll(async () => {
  await prisma.$disconnect();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe("Stateful & Stateless Authentication and Authorization", () => {
  const testUserEmail = `test_${Date.now()}@example.com`;
  const testUserPassword = "Password123!";

  it("should register a new user successfully", async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Auth User",
        email: testUserEmail,
        password: testUserPassword,
        role: "user",
      }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as any;
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(testUserEmail);
    expect(body.user.role).toBe("user");
    expect(body.user.passwordHash).toBeUndefined(); // never expose passwordHash
  });

  it("should reject registration with duplicate email", async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Duplicate User",
        email: testUserEmail,
        password: testUserPassword,
      }),
    });

    expect(res.status).toBe(409);
    const body = (await res.json()) as any;
    expect(body.error).toBe("Email already in use");
  });

  describe("Stateful Authentication (Session-based)", () => {
    let sessionCookie = "";
    let sessionId = "";

    it("should log in and return session id and set-cookie header", async () => {
      const res = await fetch(`${baseUrl}/auth/session/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUserEmail,
          password: testUserPassword,
        }),
      });

      expect(res.status).toBe(200);
      const setCookie = res.headers.get("set-cookie");
      expect(setCookie).toBeTruthy();
      expect(setCookie).toContain("sid=");

      // Extract cookie value for subsequent requests
      const match = setCookie?.match(/sid=([^;]+)/);
      sessionCookie = match ? match[0] : "";
      sessionId = match ? match[1]! : "";

      const body = (await res.json()) as any;
      expect(body.session).toBeDefined();
      expect(body.session.id).toBe(sessionId);
      expect(body.user.email).toBe(testUserEmail);
    });

    it("should authenticate stateful requests with session cookie", async () => {
      const res = await fetch(`${baseUrl}/auth/session/me`, {
        headers: { Cookie: sessionCookie },
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.authMethod).toBe("session");
      expect(body.user.email).toBe(testUserEmail);
      expect(body.sessionId).toBe(sessionId);
    });

    it("should authenticate stateful requests with X-Session-Id header", async () => {
      const res = await fetch(`${baseUrl}/auth/session/me`, {
        headers: { "X-Session-Id": sessionId },
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.authMethod).toBe("session");
      expect(body.user.email).toBe(testUserEmail);
    });

    it("should log out and invalidate the stateful session in DB", async () => {
      const logoutRes = await fetch(`${baseUrl}/auth/session/logout`, {
        method: "POST",
        headers: { Cookie: sessionCookie },
      });

      expect(logoutRes.status).toBe(200);
      const clearCookie = logoutRes.headers.get("set-cookie");
      expect(clearCookie).toContain("sid=;");

      // Verify subsequent request with the same session cookie fails
      const meRes = await fetch(`${baseUrl}/auth/session/me`, {
        headers: { Cookie: sessionCookie },
      });

      expect(meRes.status).toBe(401);
    });
  });

  describe("Stateless Authentication (JWT-based)", () => {
    let jwtToken = "";

    it("should log in and return a signed JWT bearer token", async () => {
      const res = await fetch(`${baseUrl}/auth/jwt/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUserEmail,
          password: testUserPassword,
        }),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.token).toBeDefined();
      expect(body.tokenType).toBe("Bearer");
      expect(body.user.email).toBe(testUserEmail);
      jwtToken = body.token;
    });

    it("should authenticate stateless requests with Bearer JWT", async () => {
      const res = await fetch(`${baseUrl}/auth/jwt/me`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.authMethod).toBe("jwt");
      expect(body.user.email).toBe(testUserEmail);
    });

    it("should reject requests with invalid or tampered JWT", async () => {
      const res = await fetch(`${baseUrl}/auth/jwt/me`, {
        headers: { Authorization: `Bearer ${jwtToken}invalid` },
      });

      expect(res.status).toBe(401);
    });
  });

  describe("Unified Authentication endpoint (/auth/me)", () => {
    it("should accept JWT bearer token", async () => {
      const loginRes = await fetch(`${baseUrl}/auth/jwt/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUserEmail,
          password: testUserPassword,
        }),
      });
      const { token } = (await loginRes.json()) as any;

      const res = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.authMethod).toBe("jwt");
      expect(body.user.email).toBe(testUserEmail);
    });

    it("should accept stateful session cookie", async () => {
      const loginRes = await fetch(`${baseUrl}/auth/session/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUserEmail,
          password: testUserPassword,
        }),
      });
      const cookie = loginRes.headers.get("set-cookie") ?? "";

      const res = await fetch(`${baseUrl}/auth/me`, {
        headers: { Cookie: cookie },
      });
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.authMethod).toBe("session");
      expect(body.user.email).toBe(testUserEmail);
    });
  });

  describe("Authorization (Role-based and Ownership-based)", () => {
    let regularToken = "";
    let adminToken = "";
    let regularUserId: number;

    beforeAll(async () => {
      // 1. Regular user token
      const regLogin = await fetch(`${baseUrl}/auth/jwt/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUserEmail,
          password: testUserPassword,
        }),
      });
      const regData = (await regLogin.json()) as any;
      regularToken = regData.token;
      regularUserId = regData.user.id;

      // 2. Admin user token (Ada Lovelace seeded as admin)
      const adminLogin = await fetch(`${baseUrl}/auth/jwt/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "ada@example.com",
          password: "password123",
        }),
      });
      const adminData = (await adminLogin.json()) as any;
      adminToken = adminData.token;
    });

    it("should forbid regular user from accessing admin-only endpoint", async () => {
      const res = await fetch(`${baseUrl}/auth/admin`, {
        headers: { Authorization: `Bearer ${regularToken}` },
      });

      expect(res.status).toBe(403);
      const body = (await res.json()) as any;
      expect(body.error).toBe("Forbidden");
    });

    it("should allow admin user to access admin-only endpoint", async () => {
      const res = await fetch(`${baseUrl}/auth/admin`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.message).toContain("admin-only area");
    });

    it("should allow a user to update their own profile (ownership)", async () => {
      const res = await fetch(`${baseUrl}/users/${regularUserId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${regularToken}`,
        },
        body: JSON.stringify({ name: "Updated Name By Self" }),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.name).toBe("Updated Name By Self");
    });

    it("should forbid a regular user from updating another user's profile", async () => {
      // Trying to update Ada's profile (id: 1)
      const res = await fetch(`${baseUrl}/users/1`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${regularToken}`,
        },
        body: JSON.stringify({ name: "Hacked Ada" }),
      });

      expect(res.status).toBe(403);
    });

    it("should allow admin to update another user's profile", async () => {
      const res = await fetch(`${baseUrl}/users/${regularUserId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ name: "Updated By Admin" }),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.name).toBe("Updated By Admin");
    });

    it("should forbid regular user from deleting a user", async () => {
      const res = await fetch(`${baseUrl}/users/${regularUserId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${regularToken}` },
      });

      expect(res.status).toBe(403);
    });

    it("should allow admin to delete a user", async () => {
      const res = await fetch(`${baseUrl}/users/${regularUserId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(res.status).toBe(204);
    });
  });
});
