import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { ZodType } from "zod";

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
      res.status(400).json({
        error: "Invalid request body",
        details: z.flattenError(result.error), // { formErrors, fieldErrors }
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
      res.status(400).json({
        error: "Invalid route parameters",
        details: z.flattenError(result.error),
      });
      return;
    }

    Object.assign(req.params, result.data);
    next();
  };
}
