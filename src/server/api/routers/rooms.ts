import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "server/api/trpc";
import { editRoomSchema, getByRoomCodeSchema } from "utils/types";
import { rooms } from "server/db/schema";
import { eq } from "drizzle-orm";
import { db as database } from "server/db";

async function generateRoomCode(
  codeLength: number,
  db: typeof database,
  input: { projectName: string; userId: string },
) {
  try {
    return db
      .insert(rooms)
      .values({
        ...input,
        roomCode: Math.floor(Math.random() * Math.pow(10, codeLength)),
      })
      .returning({ roomCode: rooms.roomCode });
  } catch (e: unknown) {
    if (codeLength >= 9) {
      return -1;
    }
    return generateRoomCode(codeLength + 1, db, input);
  }
}

export const roomsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(editRoomSchema)
    .mutation(async ({ ctx, input: { projectName } }) => {
      await ctx.db.delete(rooms).where(eq(rooms.userId, ctx.session.user.id));
      return generateRoomCode(4, ctx.db, {
        projectName,
        userId: ctx.session.user.id,
      });
    }),
  get: publicProcedure
    .input(getByRoomCodeSchema)
    .query(({ ctx, input: { roomCode } }) =>
      ctx.db.selectDistinct().from(rooms).where(eq(rooms.roomCode, roomCode)),
    ),
  delete: protectedProcedure.mutation(({ ctx }) =>
    ctx.db.delete(rooms).where(eq(rooms.userId, ctx.session.user.id)),
  ),
});
