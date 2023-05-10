import { GameType } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const gameRouter = createTRPCRouter({
  create: protectedProcedure.mutation(({ ctx }) =>
    ctx.prisma.game.create({
      data: {
        userId: ctx.session.user.id,
      },
    })
  ),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().min(1).max(64).optional(),
        type: z.nativeEnum(GameType).optional(),
        timeLimitInMinutes: z.number().min(1).optional(),
      })
    )
    .mutation(({ ctx, input: { id, ...data } }) =>
      ctx.prisma.game.update({
        where: {
          userId_id: {
            id,
            userId: ctx.session.user.id,
          },
        },
        data,
      })
    ),
  get: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(({ ctx, input: { id } }) =>
      ctx.prisma.game.findUnique({
        where: {
          userId_id: {
            id,
            userId: ctx.session.user.id,
          },
        },
      })
    ),
  getFull: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(({ ctx, input: { id } }) =>
      ctx.prisma.game.findUnique({
        where: {
          userId_id: {
            id,
            userId: ctx.session.user.id,
          },
        },
        include: {
          rounds: {
            include: {
              nextRoundPossibilities: {
                include: {
                  conditions: true,
                },
              },
              slides: {
                include: {
                  images: true,
                  multipleChoiceOptions: true,
                  nextSlidePossibilities: {
                    include: {
                      conditions: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
    ),
  getAll: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.game.findMany({ where: { userId: ctx.session.user.id } })
  ),
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input: { id } }) =>
      ctx.prisma.game.delete({
        where: { userId_id: { id, userId: ctx.session.user.id } },
      })
    ),
});
