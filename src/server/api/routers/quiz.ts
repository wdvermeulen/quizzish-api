import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const quizRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().max(256) }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.quiz.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
          type: "REGULAR_QUIZ",
        },
      })
    ),
  getAll: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.quiz.findMany({ where: { userId: ctx.session.user.id } })
  ),
  getDetail: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(({ ctx, input: { id } }) =>
      ctx.prisma.quiz.findFirst({
        where: { id, userId: ctx.session.user.id },
        include: {
          rounds: {
            include: {
              slides: { include: { answerOptions: true, images: true } },
            },
          },
        },
      })
    ),
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input: { id } }) =>
      ctx.prisma.quiz.deleteMany({ where: { id, userId: ctx.session.user.id } })
    ),
  changeName: protectedProcedure
    .input(z.object({ id: z.string().cuid(), name: z.string().max(256) }))
    .mutation(({ ctx, input: { id, name } }) =>
      ctx.prisma.quiz.update({
        where: { id },
        data: { name },
      })
    ),
});
