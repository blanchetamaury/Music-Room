import { errorHandler } from '@/utils/error';
import { parseBody } from '@/utils/parsing';
import { getUserFromToken } from '@/utils/token';
import { z } from 'zod';
import { getUserById, updateUser } from '../../../prisma/database/user';
import { UpdateUserSchema } from '../../schema/UpdateUserSchema';

export async function GET(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await getUserFromToken(req);

		if (!userId) return Response.json({ success: false, message: 'No token provided' }, { status: 401 });

		const user = await getUserById(userId, {});

		if (!user) return Response.json({ success: false, message: 'User not found' }, { status: 404 });

		const {
			passwordHash,
			fortytwoOauthId,
			fortytwoUserId,
			googleOauthId,
			deezerAccessToken,
			deezerUserId,
			...privateUser
		} = user;
		return Response.json({ success: true, data: privateUser }, { status: 200 });
	});
}

export async function PATCH(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await getUserFromToken(req);
		if (!userId) return Response.json({ success: false, message: 'No token provided' }, { status: 401 });

		const data = await parseBody<z.infer<typeof UpdateUserSchema>>(req, UpdateUserSchema);
		const user = await updateUser(userId, data);
		const {
			passwordHash,
			fortytwoOauthId,
			fortytwoUserId,
			googleOauthId,
			deezerAccessToken,
			deezerUserId,
			...privateUser
		} = user;

		return Response.json({ success: true, data: privateUser }, { status: 200 });
	});
}
