import { errorHandler } from '@/utils/error';
import { getUserFromToken } from '@/utils/token';
import { getUserById } from '../../../prisma/database/user';

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
