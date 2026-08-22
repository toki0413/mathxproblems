import { authRouter } from "./auth-router";
import { submissionsRouter } from "./submissions-router";
import { updatesRouter } from "./updates-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  submissions: submissionsRouter,
  updates: updatesRouter,
});

export type AppRouter = typeof appRouter;
