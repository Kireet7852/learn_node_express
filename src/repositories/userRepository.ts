import db from "../db/client.js";
import type { User, CreateUserInput } from "../db/schema.js";

// ── Repository functions ──────────────────────────────────────────────────────
// Queries are prepared inline (not at module load time) so they execute
// after migrations have already created the tables.

export function findAllUsers(): User[] {
  return db
    .query<User, []>(
      "SELECT id, name, email, created_at FROM users ORDER BY id"
    )
    .all();
}

export function findUserById(id: number): User | null {
  return (
    db
      .query<User, [number]>(
        "SELECT id, name, email, created_at FROM users WHERE id = ?"
      )
      .get(id) ?? null
  );
}

export function createUser(input: CreateUserInput): User {
  const row = db
    .query<User, [string, string]>(
      "INSERT INTO users (name, email) VALUES (?, ?) RETURNING *"
    )
    .get(input.name, input.email);

  if (!row) throw new Error("Insert failed — no row returned");
  return row;
}

export function updateUser(
  id: number,
  input: Partial<CreateUserInput>
): User | null {
  const existing = findUserById(id);
  if (!existing) return null;

  return (
    db
      .query<User, [string, string, number]>(
        "UPDATE users SET name = ?, email = ? WHERE id = ? RETURNING *"
      )
      .get(input.name ?? existing.name, input.email ?? existing.email, id) ??
    null
  );
}

export function deleteUser(id: number): boolean {
  const row = db
    .query<{ id: number }, [number]>(
      "DELETE FROM users WHERE id = ? RETURNING id"
    )
    .get(id);
  return row !== null;
}

