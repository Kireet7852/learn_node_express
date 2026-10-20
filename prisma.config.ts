// Prisma CLI configuration (Prisma 7+).
// Used by `prisma migrate`, `prisma generate`, `prisma studio`, etc.
// Docs: https://www.prisma.io/docs/orm/reference/prisma-config-reference
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
