import { GameType } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const gameRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z
        .object({
          name: z.optional(z.string().min(1).max(64)),
          type: z.optional(z.nativeEnum(GameType)),
          timeLimitInMinutes: z.optional(z.number().min(1)),
        })
        .nullish()
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
        name: z.optional(z.string().min(1).max(64)),
        type: z.optional(z.nativeEnum(GameType)),
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
