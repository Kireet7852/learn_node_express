import { configDotenv } from "dotenv";
import { z } from "zod";

// Load .env into process.env (no-op if the file doesn't exist)
configDotenv();

// ── Schema ────────────────────────────────────────────────────────────────────
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DB_PATH: z.string().default("./data/app.db"),
  // Comma-separated list of allowed origins, e.g. "http://localhost:5173,https://myapp.com"
  CORS_ORIGIN: z.string().default("*"),
});

// ── Validate ──────────────────────────────────────────────────────────────────
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:\n", parsed.error.format());
  process.exit(1);
}

// ── Typed config export ───────────────────────────────────────────────────────
export const config = {
  port: parsed.data.PORT,
  nodeEnv: parsed.data.NODE_ENV,
  dbPath: parsed.data.DB_PATH,
  // Split comma-separated origins into an array (or keep "*" as-is)
  corsOrigin: parsed.data.CORS_ORIGIN.includes(",")
    ? parsed.data.CORS_ORIGIN.split(",").map((o) => o.trim())
    : parsed.data.CORS_ORIGIN,
} as const;

export type Config = typeof config;

