import { errorHandler } from '@/utils/error';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { getUserById } from '../../../../prisma/database/user';
import { findAllLikesUser } from '../../../../prisma/database/like';

export async function GET(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireVerifiedEmail(req);
		const user = await getUserById(userId, {});

		if (!user) return Response.json({ success: false, message: 'User not found' }, { status: 404 });

		const likes = await findAllLikesUser({ track: { include: { album: true } } }, user.id);
		return Response.json({ success: true, data: likes }, { status: 200 });
	});
}
