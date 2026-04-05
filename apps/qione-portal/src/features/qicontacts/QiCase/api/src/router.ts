import { router } from "./lib/trpc.js";
import { userRouter } from "./routers/user.js";
import { organizationRouter } from "./routers/organization.js";
import { caseRouter } from "./routers/case.js";

/**
 * Main tRPC router for the application.
 *
 * This router combines all domain-specific routers into a single
 * nested structure that can be consumed by the tRPC client.
 *
 * @see https://trpc.io/docs/server/routers
 */
export const mainRouter = router({
  user: userRouter,
  organization: organizationRouter,
  case: caseRouter,
});

/**
 * Type definition for the main router.
 * This is exported to be used by the tRPC client on the frontend.
 */
export type AppRouter = typeof mainRouter;
