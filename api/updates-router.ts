import { z } from "zod";
import { adminQuery, createRouter, publicQuery } from "./middleware";
import { insertProblemUpdate, listProblemUpdates, listUpdatedProblemIds } from "./queries/updates";

export const updatesRouter = createRouter({
  byProblem: publicQuery
    .input(z.object({ problemId: z.string().min(1).max(32) }))
    .query(async ({ input }) => listProblemUpdates(input.problemId)),

  recent: publicQuery.query(() => listUpdatedProblemIds()),

  record: adminQuery
    .input(
      z.object({
        problemId: z.string().min(1).max(32),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
        note: z.string().min(1).max(2000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await insertProblemUpdate({
        problemId: input.problemId,
        userId: ctx.user.id,
        date: input.date,
        note: input.note,
      });
      return { ok: true };
    }),
});