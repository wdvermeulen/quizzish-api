import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const slideRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        roundId: z.string().cuid(),
        type: z.string().max(64),
        question: z.string().min(1).max(512),
        name: z.optional(z.string().max(128)),
        seconds: z.optional(z.number().min(1)),
        explanation: z.optional(z.string().max(512)),
        largeText: z.optional(z.string().max(16777215)),
        media: z.optional(z.string().max(128)),
      })
    )
    .mutation(({ input, ctx }) =>
      ctx.prisma.slide.create({
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
        type: z.optional(z.string().max(64)),
        roundId: z.optional(z.string().cuid()),
        question: z.optional(z.string().min(1).max(512)),
        name: z.optional(z.string()),
        seconds: z.optional(z.number().min(1)),
        explanation: z.optional(z.string().max(512)),
        largeText: z.optional(z.string().max(16777215)),
        media: z.optional(z.string().max(128)),
      })
    )
    .mutation(({ ctx, input: { id, ...rest } }) =>
      ctx.prisma.slide.updateMany({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        data: { ...rest },
      })
    ),
  delete: protectedProcedure
    .input(z.object({ slideId: z.string().cuid() }))
    .mutation(({ ctx, input: { slideId } }) => {
      return ctx.prisma.slide.deleteMany({
        where: {
          id: slideId,
          userId: ctx.session.user.id,
        },
      });
    }),
});
