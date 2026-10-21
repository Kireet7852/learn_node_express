// Seed script — populates the DB with sample data.
// Run with `bun run db:seed` (or automatically via `prisma migrate reset`).
// Idempotent: uses upsert, so re-running never fails on duplicate emails.
import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaLibSql({
  url: process.env["DATABASE_URL"] ?? "file:./data/app.db",
});
const prisma = new PrismaClient({ adapter });

const users = [
  // Ada is the admin for testing role-based authorization
  { name: "Ada Lovelace", email: "ada@example.com", role: "admin", password: "password123" },
  { name: "Grace Hopper", email: "grace@example.com", role: "user", password: "password123" },
  { name: "Alan Turing", email: "alan@example.com", role: "user", password: "password123" },
];

for (const user of users) {
  // Hash the password — never store plain text
  const passwordHash = await Bun.password.hash(user.password);

  await prisma.user.upsert({
    where: { email: user.email },
    // update also backfills credentials for pre-auth rows
    update: { name: user.name, passwordHash, role: user.role },
    create: { name: user.name, email: user.email, passwordHash, role: user.role },
  });
}

console.log(
  `[seed] Upserted ${users.length} users (login: <email> / password123; ada@example.com is admin).`
);
await prisma.$disconnect();
