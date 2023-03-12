import { GameType } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const gameRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({ name: z.string().max(256), type: z.nativeEnum(GameType) })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.game.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      })
    ),
  getAll: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.game.findMany({ where: { userId: ctx.session.user.id } })
  ),
  getDetail: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(({ ctx, input: { id } }) =>
      ctx.prisma.game.findFirst({
        where: { id, userId: ctx.session.user.id },
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
  changeName: protectedProcedure
    .input(z.object({ id: z.string().cuid(), name: z.string().max(256) }))
    .mutation(({ ctx, input: { id, name } }) =>
      ctx.prisma.game.update({
        where: { userId_id: { id, userId: ctx.session.user.id } },
        data: { name },
      })
    ),
});
