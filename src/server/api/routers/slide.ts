import { CheckMethod, GameType, SlideType } from "@prisma/client";
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
            round: {
              select: {
                game: {
                  select: {
                    type: true,
                  },
                },
              },
            },
          },
        })
        .then((data) =>
          ctx.prisma.slide.create({
            data: {
              roundId: input.roundId,
              index: (data?.index ?? 0) + 1,
              userId: ctx.session.user.id,
              ...(data?.round.game.type === GameType.REGULAR_QUIZ && {
                type: SlideType.MULTIPLE_CHOICE,
                timeLimitInSeconds: 30,
                checkMethod: CheckMethod.AUTOMATIC,
                pointsForTime: true,
                pointsForOrder: false,
              }),
              ...(data?.round.game.type === GameType.PUBQUIZ && {
                type: SlideType.OPEN,
                checkMethod: CheckMethod.MANUAL,
                pointsForTime: false,
                pointsForOrder: false,
              }),
              ...(data?.round.game.type === GameType.ESCAPE_ROOM && {
                type: SlideType.OPEN,
                checkMethod: CheckMethod.AUTOMATIC,
                pointsForTime: false,
                pointsForOrder: true,
              }),
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
          nextSlidePossibilities: true,
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
