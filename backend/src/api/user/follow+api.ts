import { z } from 'zod';
import { errorHandler, ERRORS_DETAILS } from '@/utils/error';
import { getUserFromToken } from '@/utils/token';
import { requireUser } from '@/lib/require-verified-email';
import { rateLimit } from '@/lib/apply-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { followUser, getFollowCounts, isFollowing, unfollowUser, userExists } from '../../../prisma/database/profile';

const bodySchema = z.object({ user_id: z.string().min(1).max(64) }).strict();

const relationship = async (userId: string, targetId: string, following: boolean) => {
	const counts = await getFollowCounts(userId);
	return { following, followersCount: counts.followers, followingCount: counts.following };
};

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const limited = await rateLimit(req, RATE_LIMITS.playlistMutation);
		if (limited) return limited;

		const userId = await requireUser(req);

		const parsed = bodySchema.safeParse(await req.json().catch(() => null));
		if (!parsed.success) return ERRORS_DETAILS.invalid_body();

		const targetId = parsed.data.user_id;
		if (targetId === userId) return ERRORS_DETAILS.invalid_body();

		if (!(await userExists(targetId))) {
			return Response.json({ success: false, message: 'User not found' }, { status: 404 });
		}

		await followUser(userId, targetId);

		return Response.json(
			{
				success: true,
				data: await relationship(userId, targetId, true),
			},
			{ status: 200 }
		);
	});
}

export async function DELETE(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const limited = await rateLimit(req, RATE_LIMITS.playlistMutation);
		if (limited) return limited;

		const userId = await requireUser(req);

		const parsed = bodySchema.safeParse(await req.json().catch(() => null));
		if (!parsed.success) return ERRORS_DETAILS.invalid_body();

		if (parsed.data.user_id === userId) return ERRORS_DETAILS.invalid_body();

		if (!(await userExists(parsed.data.user_id))) {
			return Response.json({ success: false, message: 'User not found' }, { status: 404 });
		}

		await unfollowUser(userId, parsed.data.user_id);

		return Response.json(
			{
				success: true,
				data: await relationship(userId, parsed.data.user_id, false),
			},
			{ status: 200 }
		);
	});
}

export async function GET(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await getUserFromToken(req);
		if (!userId) return Response.json({ success: false, message: 'No token provided' }, { status: 401 });

		const url = new URL(req.url);
		const targetId = url.searchParams.get('user_id');
		if (!targetId) return Response.json({ success: false, message: 'missing user_id' }, { status: 400 });

		return Response.json(
			{
				success: true,
				data: {
					following: targetId === userId ? false : await isFollowing(userId, targetId),
					target: await getFollowCounts(targetId),
				},
			},
			{ status: 200 }
		);
	});
}
