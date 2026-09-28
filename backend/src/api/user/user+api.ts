import { errorHandler } from '@/utils/error';
import { getUserFromToken } from '@/utils/token';
import { getProfileFor } from '../../../prisma/database/profile';

export async function GET(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const url = new URL(req.url);
		const userId = await getUserFromToken(req);

		if (!userId) return Response.json({ success: false, message: 'No token provided' }, { status: 401 });

		const targetId = url.searchParams.get('user_id');
		if (!targetId) return Response.json({ error: 'missing user_id' }, { status: 400 });

		const { profile, visible, email, preferences } = await getProfileFor(targetId, userId);

		if (!profile || !visible.PROFILE_BASICS) {
			return Response.json({ success: false, message: 'User not found' }, { status: 404 });
		}

		return Response.json(
			{
				success: true,
				data: {
					...profile,
					...(email ? { email } : {}),
					...(preferences ? { musicPreferences: preferences } : {}),
					visible,
				},
			},
			{ status: 200 }
		);
	});
}
