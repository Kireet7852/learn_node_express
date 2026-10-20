import { Router } from "express";
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = Router();

router.get("/", listUsers);
router.post("/", createUser);
router.get("/:id", getUserById);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;

