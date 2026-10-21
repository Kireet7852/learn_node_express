import type { Request, Response, NextFunction } from "express";

/**
 * Role-Based Access Control (RBAC) middleware factory.
 *
 * Ensures the authenticated user has at least one of the specified roles.
 * Must be preceded by an authentication middleware (e.g. authenticate, authenticateJwt, or authenticateSession).
 *
 * Usage:
 *   router.delete("/users/:id", authenticate, requireRole("admin"), deleteUser);
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: "Unauthorized",
        details: "Authentication required prior to role authorization",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: "Forbidden",
        details: `Insufficient permissions. Requires one of: ${allowedRoles.join(", ")}`,
      });
      return;
    }

    next();
  };
}

/**
 * Ownership or Admin authorization middleware factory.
 *
 * Grants access if:
 * 1. The user has the "admin" role, OR
 * 2. The user's ID matches the owner ID extracted from the request.
 *
 * Usage:
 *   router.patch("/users/:id", authenticate, requireOwnerOrAdmin(req => Number(req.params.id)), updateUser);
 */
export function requireOwnerOrAdmin(getOwnerId: (req: Request) => number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: "Unauthorized",
        details: "Authentication required",
      });
      return;
    }

    const ownerId = getOwnerId(req);
    const isOwner = req.user.id === ownerId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        error: "Forbidden",
        details: "You do not have permission to access or modify this resource",
      });
      return;
    }

    next();
  };
}
