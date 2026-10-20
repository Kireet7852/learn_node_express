import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

// POST /echo — echoes back the request body
router.post("/", (req: Request, res: Response): void => {
  res.json({ youSent: req.body });
});

export default router;
