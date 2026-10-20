// Shared TypeScript types that mirror the DB schema.
// Keep in sync with the DDL in migrate.ts.

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string; // ISO-8601 stored as TEXT
}

export type CreateUserInput = Omit<User, "id" | "created_at">;
