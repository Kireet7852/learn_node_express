import { Router } from "express";
import healthRouter from "./health.js";
import usersRouter from "./users.js";
import echoRouter from "./echo.js";
import authRouter from "./auth.js";
import wsRouter from "./ws.js";
import { getRoot } from "../controllers/rootController.js";
import { getWsDemo } from "../controllers/wsDemoController.js";

const router = Router();

router.get("/", getRoot);
router.get("/ws-demo", getWsDemo);

router.use("/health", healthRouter);
router.use("/users", usersRouter);
router.use("/echo", echoRouter);
router.use("/auth", authRouter);
router.use("/ws", wsRouter);

export default router;

