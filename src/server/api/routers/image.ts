import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const imageRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        slideId: z.string().cuid(),
        image: z.string().max(128),
      })
    )
    .mutation(({ input, ctx }) =>
      ctx.prisma.image.create({
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
        slideId: z.optional(z.string().cuid()),
        image: z.optional(z.string().max(128)),
      })
    )
    .mutation(({ ctx, input: { id, ...rest } }) =>
      ctx.prisma.image.updateMany({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        data: { ...rest },
      })
    ),
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input: { id } }) => {
      return ctx.prisma.image.deleteMany({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });
    }),
});
