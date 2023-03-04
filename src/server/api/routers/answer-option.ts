import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const answerOptionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        slideId: z.string().cuid(),
        description: z.string().min(1).max(512),
        isCorrect: z.optional(z.string().max(128)),
        earlyPoints: z.optional(z.number()),
        latePoints: z.optional(z.number()),
      })
    )
    .mutation(({ input, ctx }) =>
      ctx.prisma.answerOption.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      })
    ),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        slideId: z.optional(z.string().cuid()),
        description: z.optional(z.string().min(1).max(512)),
        isCorrect: z.optional(z.string().max(128)),
        earlyPoints: z.optional(z.number()),
        latePoints: z.optional(z.number()),
      })
    )
    .mutation(({ ctx, input: { id, ...rest } }) =>
      ctx.prisma.slide.updateMany({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        data: { ...rest },
      })
    ),
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input: { id } }) => {
      return ctx.prisma.slide.deleteMany({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });
    }),
});
