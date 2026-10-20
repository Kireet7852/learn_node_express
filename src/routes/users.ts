import { Router } from "express";
import { getUserById } from "../controllers/userController.js";

const router = Router();

// GET /users/:id
router.get("/:id", getUserById);

export default router;

