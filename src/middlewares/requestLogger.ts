import morgan from "morgan";
import type { Request, Response } from "express";
import { config } from "../config/env.js";
import { morganStream } from "../utils/logger.js";

// Development: readable color-coded concise format (method, path, status, response time, length)
const devFormat = ":method :url :status :response-time ms - :res[content-length]";

// Production: comprehensive Apache/Nginx-style combined format with response duration
const prodFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" (:response-time ms)';

export const requestLogger = morgan(
  config.nodeEnv === "production" ? prodFormat : devFormat,
  {
    stream: morganStream,
    skip: (_req: Request, _res: Response) => {
      // In test environment, skip Morgan stdout unless LOG_LEVEL is explicitly set
      return config.nodeEnv === "test" && !process.env["LOG_LEVEL"];
    },
  }
);

export default requestLogger;
