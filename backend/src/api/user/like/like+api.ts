import { errorHandler } from '@/utils/error';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { getUserById } from '../../../../prisma/database/user';
import { findLikeUser } from '../../../../prisma/database/like';

export async function GET(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const url = new URL(req.url);
		const trackId = url.searchParams.get('track_id');

		if (!trackId) {
			return Response.json({ error: 'missing query' }, { status: 400 });
		}

		const userId = await requireVerifiedEmail(req);
		const user = await getUserById(userId, {});

		if (!user) return Response.json({ success: false, message: 'User not found' }, { status: 404 });

		const like = await findLikeUser({ track: true }, user.id, trackId);
		return Response.json({ success: true, data: like }, { status: 200 });
	});
}
