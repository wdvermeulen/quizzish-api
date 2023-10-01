import { z } from "zod";

export const gameRangeToMinutes = [
  15, 30, 45, 60, 90, 120, 180, 360, 480, 960, 1440,
] as const;
export const gameSchemaTimeLimit = z
  .union([
    z.literal(15),
    z.literal(30),
    z.literal(45),
    z.literal(60),
    z.literal(90),
    z.literal(120),
    z.literal(180),
    z.literal(360),
    z.literal(480),
    z.literal(960),
    z.literal(1440),
  ])
  .optional();
export const roundRangeToMinutes = [
  1,
  3,
  5,
  10,
  15,
  30,
  45,
  60,
  90,
  120,
  180,
  null,
] as const;

export const roundSchemaTimeLimit = z
  .union([
    z.literal(1),
    z.literal(3),
    z.literal(5),
    z.literal(10),
    z.literal(15),
    z.literal(30),
    z.literal(45),
    z.literal(60),
    z.literal(90),
    z.literal(120),
    z.literal(180),
  ])
  .nullish();

export const slideRangeToSeconds = [
  3,
  5,
  10,
  15,
  30,
  45,
  60,
  90,
  120,
  180,
  300,
  null,
] as const;
export const slideSchemaTimeLimit = z
  .union([
    z.literal(3),
    z.literal(5),
    z.literal(10),
    z.literal(15),
    z.literal(30),
    z.literal(45),
    z.literal(60),
    z.literal(90),
    z.literal(120),
    z.literal(180),
    z.literal(300),
  ])
  .nullish();

export const toClosestGameValue = (value: number) =>
  gameRangeToMinutes.reduce((previous, current) =>
    Math.abs(current - value) < Math.abs(previous - value) ? current : previous
  );

export const toClosestRoundValue = (value: number) =>
  roundRangeToMinutes.reduce((previous, current) =>
    typeof current === "number" &&
    typeof previous === "number" &&
    Math.abs(current - value) < Math.abs(previous - value)
      ? current
      : previous
  );

export const toClosestSlideValue = (value: number) =>
  slideRangeToSeconds.reduce((previous, current) =>
    typeof current === "number" &&
    typeof previous === "number" &&
    Math.abs(current - value) < Math.abs(previous - value)
      ? current
      : previous
  );
