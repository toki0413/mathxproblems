import { submissionsRouter } from "./submissions-router";
import { updatesRouter } from "./updates-router";
import { attemptsRouter } from "./attempts-router";
import { commentsRouter } from "./comments-router";
import { flagsRouter } from "./flags-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  submissions: submissionsRouter,
  updates: updatesRouter,
  attempts: attemptsRouter,
  comments: commentsRouter,
  flags: flagsRouter,
});

export type AppRouter = typeof appRouter;
