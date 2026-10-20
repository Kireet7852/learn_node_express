import app from "./app.js";
import { config } from "./config/env.js";

// DB schema is managed by Prisma migrations, not at server startup.
// Run `bun run db:migrate` before starting the server.

app.listen(config.port, () => {
  console.log(
    `[${config.nodeEnv}] Server running at http://localhost:${config.port}`
  );
});
