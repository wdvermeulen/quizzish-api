import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const multipleChoiceOptionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        slideId: z.string().cuid(),
      })
    )
    .mutation(({ input, ctx }) =>
      ctx.prisma.multipleChoiceOption
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
          ctx.prisma.multipleChoiceOption.create({
            data: {
              slideId: input.slideId,
              index: (data?.index ?? 0) + 1,
              userId: ctx.session.user.id,
            },
          })
        )
    ),
  get: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(({ ctx, input: { id } }) =>
      ctx.prisma.multipleChoiceOption.findUniqueOrThrow({
        where: {
          userId_id: {
            id,
            userId: ctx.session.user.id,
          },
        },
      })
    ),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        index: z.optional(z.number().min(1)),
        slideId: z.optional(z.string().cuid()),
        description: z.optional(z.string().max(512)),
        isCorrect: z.optional(z.boolean()),
        earlyPoints: z.optional(z.number()),
        latePoints: z.optional(z.number()),
      })
    )
    .mutation(async ({ ctx, input: { id, ...data } }) => {
      const index = data.index;
      if (index) {
        const multipleChoiceOption =
          await ctx.prisma.multipleChoiceOption.findUniqueOrThrow({
            where: {
              userId_id: {
                id,
                userId: ctx.session.user.id,
              },
            },
          });
        if (multipleChoiceOption.index !== index) {
          await ctx.prisma.multipleChoiceOption.updateMany({
            where: {
              userId: ctx.session.user.id,
              slideId: multipleChoiceOption.slideId,
              index: {
                gte: Math.min(multipleChoiceOption.index, index),
                lte: Math.max(multipleChoiceOption.index, index),
              },
            },
            data: {
              index:
                index > multipleChoiceOption.index
                  ? { decrement: 1 }
                  : { increment: 1 },
            },
          });
        }
      }
      return ctx.prisma.multipleChoiceOption.update({
        where: {
          userId_id: {
            id,
            userId: ctx.session.user.id,
          },
        },
        data,
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input: { id } }) =>
      ctx.prisma.multipleChoiceOption
        .delete({
          where: {
            userId_id: {
              id,
              userId: ctx.session.user.id,
            },
          },
        })
        .then((data) =>
          ctx.prisma.multipleChoiceOption.updateMany({
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
