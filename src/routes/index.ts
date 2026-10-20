import { Router } from "express";
import type { Request, Response } from "express";
import healthRouter from "./health.js";
import usersRouter from "./users.js";
import echoRouter from "./echo.js";

const router = Router();

// Root
router.get("/", (_req: Request, res: Response): void => {
  res.json({ message: "Hello from Express + Bun + TypeScript!" });
});

router.use("/health", healthRouter);
router.use("/users", usersRouter);
router.use("/echo", echoRouter);

export default router;
