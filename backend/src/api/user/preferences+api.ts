import { z } from 'zod';
import { errorHandler, ERRORS_DETAILS } from '@/utils/error';
import { getUserFromToken } from '@/utils/token';
import { requireUser } from '@/lib/require-verified-email';
import { getMusicPreferences, updateMusicPreferences } from '../../../prisma/database/profile';

const idList = z.array(z.string().min(1).max(64)).max(100).default([]);

const bodySchema = z
	.object({
		favoriteGenres: idList.optional(),
		favoriteArtists: idList.optional(),
		favoriteAlbums: idList.optional(),
		favoriteTracks: idList.optional(),
	})
	.strict();

export async function GET(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await getUserFromToken(req);
		if (!userId) return Response.json({ success: false, message: 'No token provided' }, { status: 401 });

		return Response.json({ success: true, data: await getMusicPreferences(userId) }, { status: 200 });
	});
}

export async function PUT(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireUser(req);

		const parsed = bodySchema.safeParse(await req.json().catch(() => null));
		if (!parsed.success) return ERRORS_DETAILS.invalid_body();

		const updated = await updateMusicPreferences(userId, parsed.data);
		return Response.json({ success: true, data: updated }, { status: 200 });
	});
}
