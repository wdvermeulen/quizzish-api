import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../trpc';

function generateRoomCode(length) {
	const nonConfusingCharacters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	let code = '';
	for (let i = 0; i < length; i++) {
		code += nonConfusingCharacters[Math.floor(Math.random() * nonConfusingCharacters.length)];
	}
	return code;
}

export const roomRouter = createTRPCRouter({
	create: protectedProcedure
		.input(z.object({ quizId: z.string() }))
		.mutation(({ input, ctx }) => {
			console.log('create room', input);
			return ctx.prisma.room.create({
				data: {
					startCode: generateRoomCode(4),
					quizId: input.quizId,
					userId: ctx.session.user.id,
				},
			});
		}),
	getAll: protectedProcedure.query(({ ctx }) =>
		ctx.prisma.room.findMany({ where: { userId: ctx.session.user.id } })
	),
});
