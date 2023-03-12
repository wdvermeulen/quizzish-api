import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const roundRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ gameId: z.string().cuid(), name: z.optional(z.string().max(128)) }))
    .mutation(async ({ input, ctx }) =>
      ctx.prisma.round
        .findFirst({
          where: {
            userId: ctx.session.user.id,
            gameId: input.gameId,
          },
          orderBy: {
            index: "desc",
          },
          select: {
            index: true,
          },
        })
        .then((data) =>
          ctx.prisma.round.create({
            data: {
              ...input,
              index: (data?.index ?? 0) + 1,
              userId: ctx.session.user.id,
            },
          })
        )
    ),
  updateName: protectedProcedure
    .input(z.object({ id: z.string().cuid(), name: z.string().max(128) }))
    .mutation(({ ctx, input: { id, ...data } }) =>
      ctx.prisma.round.updateMany({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        data,
      })
    ),
  getAllForGame: protectedProcedure
    .input(z.object({ gameId: z.string().cuid() }))
    .query(({ ctx, input: { gameId } }) =>
      ctx.prisma.round.findMany({
        where: { userId: ctx.session.user.id, gameId },
      })
    ),
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input: { id } }) =>
      ctx.prisma.round.delete({
        where: {
          userId_id: {
            id,
            userId: ctx.session.user.id,
          }
        }
      }).then((data) =>
          ctx.prisma.round.updateMany({
            where: {
              userId: ctx.session.user.id,
              gameId: data.gameId,
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
    )
});
