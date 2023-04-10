import { CheckMethod, SlideType } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const slideRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        roundId: z.string().cuid(),
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
              roundId: input.roundId,
              index: (data?.index ?? 0) + 1,
              userId: ctx.session.user.id,
            },
          })
        )
    ),
  get: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(({ ctx, input: { id } }) =>
      ctx.prisma.slide.findUniqueOrThrow({
        where: {
          userId_id: {
            id,
            userId: ctx.session.user.id,
          },
        },
        include: {
          multipleChoiceOptions: {
            select: { id: true },
            orderBy: { index: "asc" },
          },
          images: true,
        },
      })
    ),
  getForRound: protectedProcedure
    .input(z.object({ roundId: z.string().cuid() }))
    .query(({ ctx, input: { roundId } }) =>
      ctx.prisma.slide.findMany({
        where: {
          roundId,
          userId: ctx.session.user.id,
        },
      })
    ),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        index: z.number().min(1).optional(),
        type: z.nativeEnum(SlideType).optional(),
        roundId: z.string().cuid().optional(),
        description: z.string().min(1).max(512).optional(),
        name: z.string().min(1).max(128).nullish(),
        timeLimitInSeconds: z.number().min(1).nullish(),
        checkMethod: z.nativeEnum(CheckMethod).optional(),
        explanation: z.string().min(1).max(512).nullish(),
        largeText: z.string().min(1).max(16777215).nullish(),
        media: z.string().min(1).max(128).nullish(),
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
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input: { id } }) => {
      const removedSlide = await ctx.prisma.slide.delete({
        where: {
          userId_id: {
            id,
            userId: ctx.session.user.id,
          },
        },
      });
      await ctx.prisma.slide.updateMany({
        where: {
          userId: ctx.session.user.id,
          roundId: removedSlide.roundId,
          index: {
            gt: removedSlide.index,
          },
        },
        data: {
          index: {
            decrement: 1,
          },
        },
      });
      return removedSlide;
    }),
});
