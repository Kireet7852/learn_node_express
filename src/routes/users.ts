import { Router } from "express";
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { validateBody, validateParams } from "../middlewares/validate.js";
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from "../validators/userValidator.js";

const router = Router();

router.get("/", listUsers);
router.post("/", validateBody(createUserSchema), createUser);
router.get("/:id", validateParams(userIdParamSchema), getUserById);
router.patch(
  "/:id",
  validateParams(userIdParamSchema),
  validateBody(updateUserSchema),
  updateUser
);
router.delete("/:id", validateParams(userIdParamSchema), deleteUser);

export default router;
