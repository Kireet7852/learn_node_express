import { Router } from "express";
import { echoBody } from "../controllers/echoController.js";

const router = Router();

// POST /echo
router.post("/", echoBody);

export default router;

