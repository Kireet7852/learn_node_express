import winston from "winston";
import { config } from "../config/env.js";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Human-readable format for development
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: time, stack, ...meta }) => {
    const metaEntries = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `[${time}] ${level}: ${stack || message}${metaEntries}`;
  })
);

// Structured JSON format for production
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// Silence during automated tests unless explicitly requested via LOG_LEVEL
const isTestEnv = config.nodeEnv === "test" && !process.env["LOG_LEVEL"];

export const logger = winston.createLogger({
  level: config.logLevel,
  silent: isTestEnv,
  format: config.nodeEnv === "production" ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});

/**
 * Stream adapter to pipe Morgan HTTP access logs into Winston's `http` level.
 */
export const morganStream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};

export default logger;
