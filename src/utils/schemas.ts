import { GameType } from "@prisma/client";
import { z } from "zod";
import {
  CheckMethod,
  ComparisonType,
  ConditionType,
  LogicOperator,
  NavigationMode,
  SlideType,
  Voters,
} from ".prisma/client";
import {
  gameSchemaTimeLimit,
  roundSchemaTimeLimit,
  slideSchemaTimeLimit,
} from "utils/constants";

export const conditionSchema = z.object({
  id: z.string().cuid(),
  conditionType: z.nativeEnum(ConditionType),
  comparisonType1: z.nativeEnum(ComparisonType),
  comparisonType2: z.nativeEnum(ComparisonType).nullish(),
  logicOperator: z.nativeEnum(LogicOperator).nullish(),
  comparisonValue1: z.number(),
  comparisonValue2: z.number().nullish(),
});

export const nextRoundPossibilitySchema = z.object({
  id: z.string().cuid(),
  nextRoundId: z.string().cuid().nullish(),
  conditions: z.array(conditionSchema),
});

export const nextSlidePossibilitySchema = z.object({
  id: z.string().cuid(),
  nextSlideId: z.string().cuid(),
  conditions: z.array(conditionSchema),
});

export const multipleChoiceOptionSchema = z.object({
  id: z.string().cuid(),
  nextSlideId: z.string().cuid().nullish(),
  description: z.string().min(1).max(512).nullish(),
  isRegex: z.boolean().optional(),
  earlyPoints: z.number().min(-10).max(10).nullish(),
  latePoints: z.number().min(-10).max(10).nullish(),
});

export const slideSchema = z.object({
  id: z.string().cuid(),
  index: z.number().min(1).optional(),
  type: z.nativeEnum(SlideType).optional(),
  name: z.string().min(1).max(128).nullish(),
  roundId: z.string().cuid().optional(),
  timeLimitInSeconds: slideSchemaTimeLimit,
  description: z.string().min(1).max(512).nullish(),
  multipleChoiceOptions: z.array(multipleChoiceOptionSchema).nullish(),
  closestToValue: z.bigint().nullish(),
  statementIsTrue: z.boolean().nullish(),
  checkMethod: z.nativeEnum(CheckMethod).optional(),
  checkAfter: z.boolean().optional(),
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
  nextSlidePossibilities: z.array(nextSlidePossibilitySchema).optional(),
});

export const roundSchema = z.object({
  id: z.string().cuid(),
  index: z.number().min(1),
  name: z.string().min(1).max(128).nullish(),
  timeLimitInMinutes: roundSchemaTimeLimit,
  description: z.string().min(1).max(1024).nullish(),
  navigationMode: z.nativeEnum(NavigationMode).optional(),
  checkAfter: z.boolean().optional(),
  nextRoundPossibilities: z.array(nextRoundPossibilitySchema).nullish(),
  slides: z.array(slideSchema).optional(),
});

export const gameSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(64).nullish(),
  description: z.string().min(1).max(1024).nullish(),
  type: z.nativeEnum(GameType).optional(),
  timeLimitInMinutes: gameSchemaTimeLimit,
  rounds: z.array(roundSchema),
});
