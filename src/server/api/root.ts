import { answerOptionRouter } from "./routers/answer-option";
import { imageRouter } from "./routers/image";
import { quizRouter } from "./routers/quiz";
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
  answerOption: answerOptionRouter,
  image: imageRouter,
  quiz: quizRouter,
  room: roomRouter,
  round: roundRouter,
  slide: slideRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
