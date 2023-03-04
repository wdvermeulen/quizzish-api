import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const answerOptionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        roomId: z.string().cuid(),
        peerId: z.string().max(64),
        name: z.string().max(128),
      })
    )
    .mutation(({ input, ctx }) =>
      ctx.prisma.host.create({
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
        roomId: z.optional(z.string().cuid()),
        peerId: z.optional(z.string()),
        name: z.optional(z.string().max(128)),
      })
    )
    .mutation(({ ctx, input: { id, ...data } }) =>
      ctx.prisma.host.updateMany({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        data,
      })
    ),
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input: { id } }) => {
      return ctx.prisma.host.deleteMany({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });
    }),
});
