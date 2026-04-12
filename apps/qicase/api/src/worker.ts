/**
 * @file Cloudflare Worker entrypoint using Hono and tRPC.
 */

import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { mainRouter } from "./router.js";
import { createDb } from "./lib/db.js";
import { createAuth } from "./lib/auth.js";
import type { AppContext } from "./lib/context.js";
import { errorHandler, notFoundHandler } from "./lib/middleware.js";
import { cors } from "hono/cors";

const app = new Hono<AppContext>();

// Middlewares
app.use("*", async (c, next) => {
  const allowedOrigins = c.env.ALLOWED_ORIGINS.split(",");
  return cors({
    origin: allowedOrigins,
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization", "x-trpc-source"],
  })(c, next);
});

// Setup context variables
app.use("*", async (c, next) => {
  const db = createDb(c.env.HYPERDRIVE_CACHED || c.env.DATABASE_URL);
  const dbDirect = createDb(c.env.HYPERDRIVE_DIRECT || c.env.DATABASE_URL);
  const auth = createAuth(dbDirect, c.env);
  
  c.set("db", db);
  c.set("dbDirect", dbDirect);
  c.set("auth", auth);

  // Parse session and user
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("session", session?.session || null);
  c.set("user", session?.user || null);

  await next();
});

// Auth endpoints
app.all("/api/auth/*", (c) => {
  return c.get("auth").handler(c.req.raw);
});

// tRPC endpoint
app.use(
  "/api/trpc/*",
  trpcServer({
    router: mainRouter,
    createContext: (opts, c) => ({
      req: c.req.raw,
      info: opts.info,
      db: c.get("db"),
      dbDirect: c.get("dbDirect"),
      session: c.get("session"),
      user: c.get("user"),
      cache: new Map(),
      env: c.env,
    }),
  }),
);

// Global handlers
app.onError(errorHandler);
app.notFound(notFoundHandler);

export default app;
