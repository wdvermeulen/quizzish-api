import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const answerOptionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        slideId: z.string().cuid(),
        description: z.string().min(1).max(512),
        isCorrect: z.optional(z.boolean()),
        earlyPoints: z.optional(z.number()),
        latePoints: z.optional(z.number()),
      })
    )
    .mutation(({ input, ctx }) =>
      ctx.prisma.answerOption
        .findFirst({
          where: {
            userId: ctx.session.user.id,
            slideId: input.slideId,
          },
          orderBy: {
            index: "desc",
          },
          select: {
            index: true,
          },
        })
        .then((data) =>
          ctx.prisma.answerOption.create({
            data: {
              ...input,
              index: (data?.index ?? 0) + 1,
              userId: ctx.session.user.id,
            },
          })
        )
    ),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        index: z.optional(z.number()),
        slideId: z.optional(z.string().cuid()),
        description: z.optional(z.string().min(1).max(512)),
        isCorrect: z.optional(z.boolean()),
        earlyPoints: z.optional(z.number()),
        latePoints: z.optional(z.number()),
      })
    )
    .mutation(({ ctx, input: { id, ...rest } }) =>
      ctx.prisma.answerOption.update({
        where: {
          userId_id: {
            id,
            userId: ctx.session.user.id,
          },
        },
        data: { ...rest },
      })
    ),
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input: { id } }) =>
      ctx.prisma.answerOption
        .delete({
          where: {
            userId_id: {
              id,
              userId: ctx.session.user.id,
            },
          },
        })
        .then((data) =>
          ctx.prisma.answerOption.updateMany({
            where: {
              userId: ctx.session.user.id,
              slideId: data.slideId,
              index: {
                gt: data.index,
              },
            },
            data: {
              index: {
                decrement: 1,
              },
            },
          })
        )
    ),
});
