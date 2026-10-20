import app from "./app.js";
import { config } from "./config/env.js";
import { runMigrations } from "./db/migrate.js";

// Apply DB migrations before accepting traffic
runMigrations();

app.listen(config.port, () => {
  console.log(
    `[${config.nodeEnv}] Server running at http://localhost:${config.port}`
  );
});
