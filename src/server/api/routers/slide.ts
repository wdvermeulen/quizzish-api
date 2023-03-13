import { SlideType } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const slideRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        roundId: z.string().cuid(),
        type: z.nativeEnum(SlideType),
        question: z.string().min(1).max(512),
        name: z.optional(z.string().max(128)),
        seconds: z.optional(z.number().min(1)),
        explanation: z.optional(z.string().max(512)),
        largeText: z.optional(z.string().max(16777215)),
        media: z.optional(z.string().max(128)),
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
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        index: z.optional(z.number().min(1)),
        type: z.nativeEnum(SlideType),
        roundId: z.optional(z.string().cuid()),
        question: z.optional(z.string().min(1).max(512)),
        name: z.optional(z.string()),
        seconds: z.optional(z.number().min(1)),
        explanation: z.optional(z.string().max(512)),
        largeText: z.optional(z.string().max(16777215)),
        media: z.optional(z.string().max(128)),
      })
    )
    .mutation(async ({ ctx, input: { id, ...rest } }) => {
      const index = rest.index;
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
              index:
                index > slide.index ? { decrement: 1 } : { increment: 1 },
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
        data: { ...rest },
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
