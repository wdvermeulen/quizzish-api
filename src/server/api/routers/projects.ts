import { createTRPCRouter, protectedProcedure } from "../trpc";
import { projects } from "server/db/schema";
import { and, eq } from "drizzle-orm";
import { editProjectSchema, getProjectSchema } from "utils/types";

export const projectsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(editProjectSchema)
    .mutation(({ ctx, input }) =>
      ctx.db
        .insert(projects)
        .values([{ ...input, userId: ctx.session.user.id }])
        .returning({ name: projects.name, userId: projects.userId }),
    ),
  update: protectedProcedure
    .input(editProjectSchema)
    .mutation(({ ctx, input }) =>
      ctx.db
        .update(projects)
        .set(input)
        .where(eq(projects.userId, ctx.session.user.id)),
    ),
  get: protectedProcedure
    .input(getProjectSchema)
    .query(({ ctx, input: { name } }) =>
      ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.name, name),
          eq(projects.userId, ctx.session.user.id),
        ),
      }),
    ),
  getFull: protectedProcedure
    .input(getProjectSchema)
    .query(({ ctx, input: { name } }) =>
      ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.name, name),
          eq(projects.userId, ctx.session.user.id),
        ),
      }),
    ),
  getAll: protectedProcedure.query(({ ctx }) =>
    ctx.db.query.projects.findMany({
      where: eq(projects.userId, ctx.session.user.id),
    }),
  ),
  delete: protectedProcedure
    .input(getProjectSchema)
    .mutation(({ ctx, input: { name } }) =>
      ctx.db
        .delete(projects)
        .where(
          and(
            eq(projects.name, name),
            eq(projects.userId, ctx.session.user.id),
          ),
        ),
    ),
});
