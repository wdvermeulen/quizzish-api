import {
  CheckMethod,
  ComparisonType,
  type Condition,
  ConditionType,
  NavigationMode,
  SlideType,
  Voters,
} from ".prisma/client";
import type { z } from "zod";
import type {
  conditionSchema,
  multipleChoiceOptionSchema,
  roundSchema,
  slideSchema,
} from "utils/schemas";
import { createId } from "@paralleldrive/cuid2";
import {
  roundRangeToMinutes,
  slideRangeToSeconds,
  toClosestRoundValue,
  toClosestSlideValue,
} from "utils/constants";

import { FullGame } from "components/edit-page-components/editComponent";

export const conditionToForm = (
  condition?: Condition,
): z.infer<typeof conditionSchema> =>
  condition
    ? {
        id: condition.id,
        conditionType: condition.conditionType,
        comparisonType1: condition.comparisonType1,
        comparisonType2: condition.comparisonType2,
        logicOperator: condition.logicOperator,
        comparisonValue1: condition.comparisonValue1,
        comparisonValue2: condition.comparisonValue2,
      }
    : {
        id: createId(),
        conditionType: ConditionType.POINTS,
        comparisonType1: ComparisonType.GREATER,
        comparisonType2: null,
        logicOperator: null,
        comparisonValue1: 0,
        comparisonValue2: null,
      };
export const mapMultipleChoiceOption = (
  option: FullGame["rounds"][number]["slides"][number]["multipleChoiceOptions"][number],
): z.infer<typeof multipleChoiceOptionSchema> => ({
  id: option.id,
  description: option.description,
  earlyPoints: option.earlyPoints,
  latePoints: option.latePoints,
  isRegex: option.isRegex,
  nextSlideId: option.nextSlideId,
});
export const slideToForm = (
  slide?: FullGame["rounds"][number]["slides"][number],
): z.infer<typeof slideSchema> =>
  slide
    ? {
        id: slide.id,
        name: slide.name,
        description: slide.description,
        type: slide.type,
        timeLimitInSeconds: slide.timeLimitInSeconds
          ? toClosestSlideValue(slide.timeLimitInSeconds)
          : null,
        closestToValue: slide.closestToValue,
        pointsForTime: slide.pointsForTime,
        pointsForOrder: slide.pointsForOrder,
        checkMethod: slide.checkMethod,
        explanation: slide.explanation,
        largeText: slide.largeText,
        checkAfter: slide.checkAfter,
        voters: slide.voters,
        earlyCorrectPoints: slide.earlyCorrectPoints,
        lateCorrectPoints: slide.lateCorrectPoints,
        earlyIncorrectPoints: slide.earlyIncorrectPoints,
        lateIncorrectPoints: slide.lateIncorrectPoints,
        nextSlidePossibilities: slide.nextSlidePossibilities.map(
          (possibility) => ({
            id: possibility.id,
            nextSlideId: possibility.nextSlideId,
            conditions: possibility.conditions.map(conditionToForm),
          }),
        ),
        multipleChoiceOptions: slide.multipleChoiceOptions.map(
          mapMultipleChoiceOption,
        ),
      }
    : {
        id: createId(),
        name: null,
        description: null,
        type: SlideType.NO_ANSWER,
        timeLimitInSeconds: slideRangeToSeconds[slideRangeToSeconds.length - 1],
        closestToValue: null,
        pointsForTime: false,
        pointsForOrder: false,
        checkMethod: CheckMethod.AUTOMATIC,
        explanation: null,
        largeText: null,
        checkAfter: true,
        voters: Voters.ALL_PARTICIPANTS,
        earlyCorrectPoints: 10,
        lateCorrectPoints: 0,
        earlyIncorrectPoints: 0,
        lateIncorrectPoints: 0,
        nextSlidePossibilities: [],
        multipleChoiceOptions: [],
      };
export const roundToForm = (
  round?: FullGame["rounds"][number],
): z.infer<typeof roundSchema> =>
  round
    ? {
        id: round.id,
        name: round.name,
        description: round.description,
        index: round.index,
        timeLimitInMinutes: round.timeLimitInMinutes
          ? toClosestRoundValue(round.timeLimitInMinutes)
          : null,
        navigationMode: round.navigationMode,
        checkAfter: round.checkAfter,
        slides: round.slides.map(slideToForm),
        nextRoundPossibilities: round.nextRoundPossibilities.map(
          (possibility) => ({
            id: possibility.id,
            nextRoundId: possibility.nextRoundId,
            conditions: possibility.conditions.map(conditionToForm),
          }),
        ),
      }
    : {
        id: createId(),
        name: null,
        description: null,
        index: 0,
        timeLimitInMinutes: roundRangeToMinutes[roundRangeToMinutes.length - 1],
        navigationMode: NavigationMode.TOGETHER,
        checkAfter: true,
        slides: [],
        nextRoundPossibilities: [],
      };
