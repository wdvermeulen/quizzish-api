import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const roundRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ quizId: z.string().cuid() }))
    .mutation(({ input, ctx }) =>
      ctx.prisma.round.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      })
    ),
  updateName: protectedProcedure
    .input(z.object({ id: z.string().cuid(), name: z.string().max(128) }))
    .mutation(({ ctx, input: { id, ...data } }) =>
      ctx.prisma.round.updateMany({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        data,
      })
    ),
  getAll: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.room.findMany({ where: { userId: ctx.session.user.id } })
  ),
});
