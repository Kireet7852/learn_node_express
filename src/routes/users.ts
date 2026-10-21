import { Router } from "express";
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { validateBody, validateParams } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { requireOwnerOrAdmin, requireRole } from "../middlewares/authorize.js";
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from "../validators/userValidator.js";

const router = Router();

// ── User routes with Authentication & Authorization ──────────────────────────

// Any authenticated user can list users
router.get("/", authenticate, listUsers);

// Only administrators can create users directly via this CRUD endpoint
// (General public signs up via POST /auth/register)
router.post(
  "/",
  authenticate,
  requireRole("admin"),
  validateBody(createUserSchema),
  createUser
);

// Any authenticated user can view a user by ID
router.get(
  "/:id",
  authenticate,
  validateParams(userIdParamSchema),
  getUserById
);

// Users can only update their own profile; admins can update anyone
router.patch(
  "/:id",
  authenticate,
  validateParams(userIdParamSchema),
  requireOwnerOrAdmin((req) => Number(req.params["id"])),
  validateBody(updateUserSchema),
  updateUser
);

// Only administrators can delete users
router.delete(
  "/:id",
  authenticate,
  validateParams(userIdParamSchema),
  requireRole("admin"),
  deleteUser
);

export default router;
