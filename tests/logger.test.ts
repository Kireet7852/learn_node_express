import { describe, expect, it } from "bun:test";
import express from "express";
import { logger, morganStream } from "../src/utils/logger.js";
import { requestLogger } from "../src/middlewares/requestLogger.js";
import { errorHandler } from "../src/middlewares/errorHandler.js";

describe("Logger & Logging Middleware", () => {
  it("should export a configured Winston logger instance", () => {
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.http).toBe("function");
    expect(typeof logger.debug).toBe("function");
  });

  it("should stream morgan messages to logger.http", () => {
    let loggedMessage = "";
    const originalHttp = logger.http.bind(logger);
    logger.http = ((msg: string) => {
      loggedMessage = msg;
      return logger;
    }) as unknown as typeof logger.http;

    try {
      morganStream.write("GET /test 200 12ms\n");
      expect(loggedMessage).toBe("GET /test 200 12ms");
    } finally {
      logger.http = originalHttp;
    }
  });

  it("should handle HTTP requests through requestLogger middleware", async () => {
    const testApp = express();
    testApp.use(requestLogger);
    testApp.get("/ping", (_req, res) => {
      res.json({ pong: true });
    });

    const server = testApp.listen(0);
    const addr = server.address();
    const port = typeof addr === "object" && addr ? addr.port : 0;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/ping`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ pong: true });
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it("should log unhandled errors in errorHandler middleware and respond with 500", async () => {
    const testApp = express();
    let errorLogged = false;
    let loggedErrorPayload: unknown = null;

    const originalError = logger.error.bind(logger);
    logger.error = ((msg: string, meta?: unknown) => {
      errorLogged = true;
      loggedErrorPayload = { msg, meta };
      return logger;
    }) as unknown as typeof logger.error;

    try {
      testApp.get("/crash", () => {
        throw new Error("Simulated unexpected crash");
      });
      testApp.use(errorHandler);

      const server = testApp.listen(0);
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : 0;

      try {
        const res = await fetch(`http://127.0.0.1:${port}/crash`);
        expect(res.status).toBe(500);
        const data = await res.json();
        expect(data).toEqual({ error: "Internal server error" });
        expect(errorLogged).toBe(true);
        expect((loggedErrorPayload as { msg: string }).msg).toBe("Simulated unexpected crash");
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    } finally {
      logger.error = originalError;
    }
  });
});
