import { projectsRouter } from "./routers/projects";
import { createTRPCRouter } from "./trpc";
import { roomsRouter } from "server/api/routers/rooms";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  projects: projectsRouter,
  rooms: roomsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
