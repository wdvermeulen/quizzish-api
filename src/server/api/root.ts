import { multipleChoiceOptionRouter } from "./routers/multiple-choice-option";
import { imageRouter } from "./routers/image";
import { gameRouter } from "./routers/game";
import { roomRouter } from "./routers/room";
import { roundRouter } from "./routers/round";
import { slideRouter } from "./routers/slide";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  multipleChoiceOption: multipleChoiceOptionRouter,
  image: imageRouter,
  game: gameRouter,
  room: roomRouter,
  round: roundRouter,
  slide: slideRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
