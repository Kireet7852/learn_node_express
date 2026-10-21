import { Router } from "express";
import healthRouter from "./health.js";
import usersRouter from "./users.js";
import echoRouter from "./echo.js";
import authRouter from "./auth.js";
import { getRoot } from "../controllers/rootController.js";

const router = Router();

router.get("/", getRoot);

router.use("/health", healthRouter);
router.use("/users", usersRouter);
router.use("/echo", echoRouter);
router.use("/auth", authRouter);

export default router;
