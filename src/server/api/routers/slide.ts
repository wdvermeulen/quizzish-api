import { CheckMethod, PointMethod, SlideType, Voters } from "@prisma/client";
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
        name: z.string().min(1).max(128).nullish(),
        roundId: z.string().cuid().optional(),
        timeLimitInSeconds: z.number().min(1).nullish(),
        description: z.string().min(1).max(512).optional(),
        multipleChoiceOptions: z
          .array(
            z.object({
              id: z.string().cuid(),
              nextSlideId: z.string().cuid().nullish(),
              description: z.string().min(1).max(512).optional(),
              isRegex: z.boolean().optional(),
              earlyPoints: z.number().min(-10).max(10).nullish(),
              latePoints: z.number().min(-10).max(10).nullish(),
            })
          )
          .optional(),
        closestToValue: z.bigint().nullish(),
        statementIsTrue: z.boolean().nullish(),
        checkMethod: z.nativeEnum(CheckMethod).optional(),
        pointMethod: z.nativeEnum(PointMethod).optional(),
        voters: z.nativeEnum(Voters).optional(),
        earlyCorrectPoints: z.number().min(-10).max(10).nullish(),
        lateCorrectPoints: z.number().min(-10).max(10).nullish(),
        earlyIncorrectPoints: z.number().min(-10).max(10).nullish(),
        lateIncorrectPoints: z.number().min(-10).max(10).nullish(),
        correctNextSlideId: z.string().cuid().nullish(),
        incorrectNextSlideId: z.string().cuid().nullish(),
        explanation: z.string().min(1).max(512).nullish(),
        largeText: z.string().min(1).max(16777215).nullish(),
        media: z.string().min(1).max(128).nullish(),
      })
    )
    .mutation(
      async ({ ctx, input: { id, multipleChoiceOptions, ...slideData } }) => {
        const index = slideData.index;
        if (index) {
          const slide = await ctx.prisma.slide.findUniqueOrThrow({
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
        if (multipleChoiceOptions) {
          for (const option of multipleChoiceOptions) {
            if (option.id) {
              await ctx.prisma.multipleChoiceOption.upsert({
                where: {
                  userId_id: { id: option.id, userId: ctx.session.user.id },
                },
                update: option,
                create: {
                  ...option,
                  slideId: id,
                  userId: ctx.session.user.id,
                  index: await ctx.prisma.multipleChoiceOption.count({
                    where: {
                      slideId: id,
                    },
                  }),
                },
              });
            }
          }
        }
        await ctx.prisma.multipleChoiceOption.deleteMany({
          where: {
            slideId: id,
            userId: ctx.session.user.id,
            NOT: {
              id: {
                in: multipleChoiceOptions?.map((option) => option.id) ?? [],
              },
            },
          },
        });
        return ctx.prisma.slide.update({
          where: {
            userId_id: {
              id,
              userId: ctx.session.user.id,
            },
          },
          data: slideData,
        });
      }
    ),
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
