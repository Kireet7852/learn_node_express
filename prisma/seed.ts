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
  { name: "Ada Lovelace", email: "ada@example.com" },
  { name: "Grace Hopper", email: "grace@example.com" },
  { name: "Alan Turing", email: "alan@example.com" },
];

for (const user of users) {
  await prisma.user.upsert({
    where: { email: user.email },
    update: { name: user.name },
    create: user,
  });
}

console.log(`[seed] Upserted ${users.length} users.`);
await prisma.$disconnect();
