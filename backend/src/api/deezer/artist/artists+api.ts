import { errorHandler } from '@/utils/error';
import { findArtist } from '../../../../prisma/database/artist';

export async function GET(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const url = new URL(req.url);
		const artistId = url.searchParams.get('deezer_id');

		if (!artistId) {
			return Response.json({ error: 'missing deezer_id' }, { status: 400 });
		}

		const artist = await findArtist(artistId);

		if (!artist) return Response.json({ success: false, message: 'User not found' }, { status: 404 });

		const { id, updatedAt, createdAt, ...artistRes } = artist;
		return Response.json({ success: true, data: { artistRes } }, { status: 200 });
	});
}
