import { z } from 'zod';
import { errorHandler, ERRORS_DETAILS } from '@/utils/error';
import { getUserFromToken } from '@/utils/token';
import { requireUser } from '@/lib/require-verified-email';
import { getAllVisibilities, setVisibility } from '../../../prisma/database/profile';
import { PROFILE_FIELDS } from '@/lib/permissions';

const level = z.enum(['PUBLIC', 'FRIENDS', 'PRIVATE']);

const bodySchema = z
	.object({
		PROFILE_BASICS: level.optional(),
		MUSIC_PREFERENCES: level.optional(),
		LIKES: level.optional(),
		PLAYLISTS: level.optional(),
		PLAY_HISTORY: level.optional(),
	})
	.strict()
	.refine((v) => PROFILE_FIELDS.some((f) => f in v), { message: 'no field provided' });

export async function GET(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await getUserFromToken(req);
		if (!userId) return Response.json({ success: false, message: 'No token provided' }, { status: 401 });

		return Response.json({ success: true, data: await getAllVisibilities(userId) }, { status: 200 });
	});
}

export async function PUT(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireUser(req);

		const parsed = bodySchema.safeParse(await req.json().catch(() => null));
		if (!parsed.success) return ERRORS_DETAILS.invalid_body();

		await setVisibility(userId, parsed.data);
		return Response.json({ success: true, data: await getAllVisibilities(userId) }, { status: 200 });
	});
}
