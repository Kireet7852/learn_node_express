# Routes

## Purpose
Express router definitions. Each file defines route paths, attaches validation and auth middleware, and delegates to controller handlers.

## Key Files
- **index.ts** — Root router. Mounts all sub-routers and serves the root `/` and `/ws-demo` pages.
- **auth.ts** — `/auth` routes: register, session login/logout, JWT login, `/me`, `/admin`.
- **users.ts** — `/users` routes: CRUD with validation and auth middleware.
- **health.ts** — `/health` route: simple health check.
- **echo.ts** — `/echo` route: request echo for debugging.
- **ws.ts** — `/ws` routes: WebSocket-related HTTP endpoints.

## Route Hierarchy
```
/             → rootController.getRoot
/ws-demo      → wsDemoController.getWsDemo
/health       → healthRouter
/users        → usersRouter (auth + validation)
/echo         → echoRouter
/auth         → authRouter
/ws           → wsRouter
```

## Conventions
- Validation middleware (`validate(...)`) runs **before** the controller handler.
- Auth middleware (`authenticate`, `authenticateSession`, `authenticateJwt`) runs before protected routes.
- Authorization (`authorize("admin")`) runs after authentication for role-gated routes.
- Keep route files thin — no business logic, just wiring middleware → controller.
