import { CheckMethod, GameType, SlideType, Voters } from "@prisma/client";
import { z } from "zod";

export const gameSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(64).nullish(),
  type: z.nativeEnum(GameType).optional(),
  timeLimitInMinutes: z.number().min(1).optional(),
  rounds: z
    .array(
      z.object({
        id: z.string().cuid(),
        index: z.number().min(1).optional(),
        name: z.string().min(1).max(128).nullish(),
        timeLimitInMinutes: z.number().nullish(),
        description: z.string().min(1).max(1024).nullish(),
        slides: z
          .array(
            z.object({
              id: z.string().cuid(),
              index: z.number().min(1).optional(),
              type: z.nativeEnum(SlideType).optional(),
              name: z.string().min(1).max(128).nullish(),
              roundId: z.string().cuid().optional(),
              timeLimitInSeconds: z.number().min(1).nullish(),
              description: z.string().min(1).max(512).nullish(),
              multipleChoiceOptions: z
                .array(
                  z.object({
                    id: z.string().cuid(),
                    nextSlideId: z.string().cuid().nullish(),
                    description: z.string().min(1).max(512).nullish(),
                    isRegex: z.boolean().optional(),
                    earlyPoints: z.number().min(-10).max(10).nullish(),
                    latePoints: z.number().min(-10).max(10).nullish(),
                  })
                )
                .nullish(),
              closestToValue: z.bigint().nullish(),
              statementIsTrue: z.boolean().nullish(),
              checkMethod: z.nativeEnum(CheckMethod).optional(),
              pointsForTime: z.boolean().optional(),
              pointsForOrder: z.boolean().optional(),
              voters: z.nativeEnum(Voters).optional(),
              earlyCorrectPoints: z.number().min(-10).max(10).optional(),
              lateCorrectPoints: z.number().min(-10).max(10).optional(),
              earlyIncorrectPoints: z.number().min(-10).max(10).optional(),
              lateIncorrectPoints: z.number().min(-10).max(10).optional(),
              correctNextSlideId: z.string().cuid().nullish(),
              incorrectNextSlideId: z.string().cuid().nullish(),
              explanation: z.string().min(1).max(512).nullish(),
              largeText: z.string().min(1).max(16777215).nullish(),
              media: z.string().min(1).max(128).nullish(),
            })
          )
          .optional(),
      })
    )
    .optional(),
});
