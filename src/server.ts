import http from "node:http";
import app from "./app.js";
import { config } from "./config/env.js";
import { initSocketServer } from "./socket/index.js";
import { logger } from "./utils/logger.js";

// DB schema is managed by Prisma migrations, not at server startup.
// Run `bun run db:migrate` before starting the server.

const httpServer = http.createServer(app);
const io = initSocketServer(httpServer);

httpServer.listen(config.port, () => {
  logger.info(
    `[${config.nodeEnv}] Server running at http://localhost:${config.port}`
  );
  logger.info(
    `[${config.nodeEnv}] WebSocket server (Socket.IO) ready at ws://localhost:${config.port}`
  );
});

export { httpServer, io };
