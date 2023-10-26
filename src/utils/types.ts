import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { projects, rooms } from "server/db/schema";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { appRouter } from "server/api/root";

export const editProjectSchema = createInsertSchema(projects).omit({
  userId: true,
});

export const getProjectSchema = createSelectSchema(projects).pick({
  name: true,
});

export const editRoomSchema = createInsertSchema(rooms).pick({
  projectName: true,
});

export const getByRoomCodeSchema = createSelectSchema(rooms).pick({
  roomCode: true,
});

export type ProjectOutput = inferRouterOutputs<
  typeof appRouter
>["projects"]["getFull"];
export type ProjectCreate = inferRouterInputs<
  typeof appRouter
>["projects"]["create"];
export type ProjectUpdate = inferRouterInputs<
  typeof appRouter
>["projects"]["update"];
