import { GameType } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const gameRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.optional(z.string().max(64)),
        type: z.optional(z.nativeEnum(GameType)),
        timeLimitInMinutes: z.optional(z.number().min(1)),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.game.create({
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
        name: z.optional(z.string().max(64).or(z.null())),
        type: z.optional(z.nativeEnum(GameType).or(z.null())),
        timeLimitInMinutes: z.optional(z.number().min(1)),
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
  getAll: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.game.findMany({ where: { userId: ctx.session.user.id } })
  ),
  getDetail: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(({ ctx, input: { id } }) =>
      ctx.prisma.game.findUnique({
        where: { userId_id: { id, userId: ctx.session.user.id } },
        include: {
          rounds: {
            include: {
              slides: {
                include: {
                  answerOptions: { orderBy: { index: "asc" } },
                  images: true,
                },
                orderBy: { index: "asc" },
              },
            },
            orderBy: { index: "asc" },
          },
        },
      })
    ),
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input: { id } }) =>
      ctx.prisma.game.delete({
        where: { userId_id: { id, userId: ctx.session.user.id } },
      })
    ),
});
