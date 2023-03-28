import { SlideType } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const slideRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        roundId: z.string().cuid(),
        type: z.optional(z.nativeEnum(SlideType)),
        description: z.optional(z.string().min(1).max(512)),
        name: z.optional(z.string().min(1).max(128).or(z.null())),
        timeLimitInSeconds: z.optional(z.number().min(1).or(z.null())),
        explanation: z.optional(z.string().min(1).max(512).or(z.null())),
        largeText: z.optional(z.string().min(1).max(16777215).or(z.null())),
        media: z.optional(z.string().min(1).max(128).or(z.null())),
      })
    )
    .mutation(({ input, ctx }) =>
      ctx.prisma.slide
        .findFirst({
          where: {
            userId: ctx.session.user.id,
            roundId: input.roundId,
          },
          orderBy: {
            index: "desc",
          },
          select: {
            index: true,
          },
        })
        .then((data) =>
          ctx.prisma.slide.create({
            data: {
              ...input,
              index: (data?.index ?? 0) + 1,
              userId: ctx.session.user.id,
            },
          })
        )
    ),
  get: protectedProcedure
    .input(z.object({ slideId: z.string().cuid() }))
    .query(({ ctx, input: { slideId } }) =>
      ctx.prisma.slide.findUniqueOrThrow({
        where: {
          userId_id: {
            id: slideId,
            userId: ctx.session.user.id,
          },
        },
        include: {
          answerOptions: { orderBy: { index: "asc" } },
          images: true,
        },
      })
    ),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        index: z.optional(z.number().min(1)),
        type: z.optional(z.nativeEnum(SlideType)),
        roundId: z.optional(z.string().cuid()),
        description: z.optional(z.string().min(1).max(512)),
        name: z.optional(z.string().min(1).max(128).or(z.null())),
        timeLimitInSeconds: z.optional(z.number().min(1).or(z.null())),
        manualCheck: z.optional(z.boolean()),
        instantCheck: z.optional(z.boolean()),
        explanation: z.optional(z.string().min(1).max(512).or(z.null())),
        largeText: z.optional(z.string().min(1).max(16777215).or(z.null())),
        media: z.optional(z.string().min(1).max(128).or(z.null())),
      })
    )
    .mutation(async ({ ctx, input: { id, ...data } }) => {
      const index = data.index;
      if (index) {
        const slide = await ctx.prisma.slide.findUniqueOrThrow({
          where: {
            userId_id: {
              id,
              userId: ctx.session.user.id,
            },
          },
        });
        if (slide.index !== index) {
          await ctx.prisma.slide.updateMany({
            where: {
              userId: ctx.session.user.id,
              roundId: slide.roundId,
              index: {
                gte: Math.min(slide.index, index),
                lte: Math.max(slide.index, index),
              },
            },
            data: {
              index: index > slide.index ? { decrement: 1 } : { increment: 1 },
            },
          });
        }
      }
      return ctx.prisma.slide.update({
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
    .input(z.object({ slideId: z.string().cuid() }))
    .mutation(({ ctx, input: { slideId } }) =>
      ctx.prisma.slide
        .delete({
          where: {
            userId_id: {
              id: slideId,
              userId: ctx.session.user.id,
            },
          },
        })
        .then((data) =>
          ctx.prisma.slide.updateMany({
            where: {
              userId: ctx.session.user.id,
              roundId: data.roundId,
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
