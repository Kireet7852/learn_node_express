import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "name is required")
    .max(80, "name must be at most 80 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("must be a valid email address")),
  password: z
    .string()
    .min(8, "password must be at least 8 characters")
    .max(100, "password must be at most 100 characters"),
  role: z
    .enum(["user", "admin"], {
      error: "role must be either 'user' or 'admin'",
    })
    .default("user"),
});

export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("must be a valid email address")),
  password: z.string().min(1, "password is required"),
});

export type LoginDto = z.infer<typeof loginSchema>;
