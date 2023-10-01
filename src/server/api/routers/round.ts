import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { roundSchema } from "utils/schemas";

export const roundRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        gameId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const lastRound = await ctx.prisma.round.findFirst({
        where: {
          userId: ctx.session.user.id,
          gameId: input.gameId,
        },
        orderBy: {
          index: "desc",
        },
        select: {
          index: true,
          id: true,
        },
      });
      const newRound = await ctx.prisma.round.create({
        data: {
          gameId: input.gameId,
          index: (lastRound?.index ?? 0) + 1,
          userId: ctx.session.user.id,
        },
      });
      if (lastRound) {
        void ctx.prisma.nextRoundPossibility.create({
          data: {
            roundId: lastRound.id,
            nextRoundId: newRound.id,
            userId: ctx.session.user.id,
          },
        });
      }
      return newRound;
    }),
  update: protectedProcedure
    .input(roundSchema)
    .mutation(async ({ ctx, input: { id, ...data } }) => {
      const index = data.index;
      if (index) {
        const round = await ctx.prisma.round.findUniqueOrThrow({
          where: {
            userId_id: {
              id,
              userId: ctx.session.user.id,
            },
          },
        });
        if (round.index !== index) {
          await ctx.prisma.round.updateMany({
            where: {
              userId: ctx.session.user.id,
              gameId: round.gameId,
              index: {
                gte: Math.min(round.index, index),
                lte: Math.max(round.index, index),
              },
            },
            data: {
              index: index > round.index ? { decrement: 1 } : { increment: 1 },
            },
          });
        }
      }
      return ctx.prisma.round.updateMany({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        data,
      });
    }),
  get: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(({ ctx, input: { id } }) =>
      ctx.prisma.round.findUniqueOrThrow({
        where: { userId_id: { userId: ctx.session.user.id, id } },
        include: {
          nextRoundPossibilities: {
            include: {
              conditions: true,
            },
          },
        },
      })
    ),
  getForGame: protectedProcedure
    .input(z.object({ gameId: z.string().cuid() }))
    .query(({ ctx, input: { gameId } }) =>
      ctx.prisma.round.findMany({
        where: { userId: ctx.session.user.id, gameId },
      })
    ),
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input: { id } }) => {
      const removedRound = await ctx.prisma.round.findUniqueOrThrow({
        where: { userId_id: { userId: ctx.session.user.id, id } },
      });
      await ctx.prisma.round.delete({
        where: {
          userId_id: {
            id,
            userId: ctx.session.user.id,
          },
        },
      });
      void ctx.prisma.round.updateMany({
        where: {
          userId: ctx.session.user.id,
          gameId: removedRound.gameId,
          index: {
            gt: removedRound.index,
          },
        },
        data: {
          index: {
            decrement: 1,
          },
        },
      });
      return removedRound;
    }),
});
