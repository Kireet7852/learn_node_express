import { z } from "zod";

// ── User property rules ──────────────────────────────────────────────────────
// These schemas are the single source of truth for what valid user data looks
// like. Routes validate incoming requests against them; the inferred types
// flow into the service layer, so invalid data can't reach the DB.

export const createUserSchema = z.object({
  name: z
    .string()
    .trim() // strip surrounding whitespace BEFORE the length check
    .min(1, "name is required")
    .max(80, "name must be at most 80 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase() // normalize so uniqueness is case-insensitive
    .pipe(z.email("must be a valid email address")),
});

// The inferred shape — `name: string, email: string`, guaranteed
export type CreateUserDto = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "name cannot be empty")
      .max(80, "name must be at most 80 characters")
      .optional(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("must be a valid email address"))
      .optional(),
  })
  // PATCH must carry at least one property — an empty update is a client bug
  .refine((data) => Object.keys(data).length > 0, {
    message: "at least one of name or email is required",
  });

export type UpdateUserDto = z.infer<typeof updateUserSchema>;

// ── Route param rules ─────────────────────────────────────────────────────────
// :id arrives as a string — coerce it, then require a positive integer
// (matches the Prisma autoincrement id). Rejects "abc", "12.5", "0", "-3".
export const userIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int("id must be an integer")
    .positive("id must be a positive integer"),
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;
