import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { ZodType } from "zod";
import { logger } from "../utils/logger.js";

/**
 * Middleware factory: validates req.body against a zod schema.
 *
 * - Invalid  → responds 400 with per-field error details, handler never runs.
 * - Valid    → replaces req.body with the PARSED value (trimmed, lowercased,
 *              coerced...) so downstream handlers can trust its shape.
 *
 * Usage in a route:
 *   router.post("/", validateBody(createUserSchema), createUser);
 */
export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const flattened = z.flattenError(result.error);
      logger.warn("Validation failed for request body", {
        path: req.path,
        method: req.method,
        errors: flattened,
      });
      res.status(400).json({
        error: "Invalid request body",
        details: flattened, // { formErrors, fieldErrors }
      });
      return;
    }

    req.body = result.data;
    next();
  };
}

/**
 * Middleware factory: validates req.params against a zod schema.
 *
 * - Invalid  → responds 400 with per-field error details, handler never runs.
 * - Valid    → writes the PARSED values back onto req.params (e.g. :id
 *              becomes a number) so downstream handlers can trust their types.
 *
 * Usage in a route:
 *   router.get("/:id", validateParams(userIdParamSchema), getUserById);
 */
export function validateParams(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const flattened = z.flattenError(result.error);
      logger.warn("Validation failed for route params", {
        path: req.path,
        method: req.method,
        params: req.params,
        errors: flattened,
      });
      res.status(400).json({
        error: "Invalid route parameters",
        details: flattened,
      });
      return;
    }

    Object.assign(req.params, result.data);
    next();
  };
}
