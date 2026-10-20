import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

// GET /users/:id
router.get("/:id", (req: Request, res: Response): void => {
  const { id } = req.params;
  res.json({ id });
});

export default router;
