import { errorHandler } from '@/utils/error';
import { rateLimit } from '@/lib/apply-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { findArtist } from '../../../../prisma/database/artist';

export async function GET(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const limited = await rateLimit(req, RATE_LIMITS.deezerLookup);
		if (limited) return limited;

		const url = new URL(req.url);
		const artistId = url.searchParams.get('deezer_id');

		if (!artistId) {
			return Response.json({ success: false, message: 'missing deezer_id' }, { status: 400 });
		}

		const artist = await findArtist(artistId);

		if (!artist) return Response.json({ success: false, message: 'Artist not found' }, { status: 404 });

		const { deezerCUID, name, pictureSmall, pictureMedium, pictureBig, nbFan, nbAlbum } = artist;

		return Response.json(
			{
				success: true,
				data: { deezerCUID, name, pictureSmall, pictureMedium, pictureBig, nbFan, nbAlbum },
			},
			{ status: 200 }
		);
	});
}
