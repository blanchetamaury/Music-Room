export interface PlayerTrack {
	id: string;
	deezerCUID: string | null;
	title: string;
	artist: string;
	cover: string | null;
	previewUrl: string | null;
	duration: number;
}


const PREVIEW_EXPIRY_PATTERN = /exp=(\d+)(?:~|&|$)/;

export const previewExpiryMs = (previewUrl: string | null | undefined): number | null => {
	if (!previewUrl) return null;
	const match = PREVIEW_EXPIRY_PATTERN.exec(previewUrl);
	if (!match) return null;

	const seconds = Number(match[1]);
	return Number.isFinite(seconds) ? seconds * 1000 : null;
};


export const isPreviewExpired = (previewUrl: string | null | undefined, now = Date.now()): boolean => {
	const expiry = previewExpiryMs(previewUrl);
	return expiry === null || expiry <= now;
};

const firstName = (value: string | null | undefined): string | null => {
	const name = value?.trim();
	return name ? name : null;
};

interface TrackLike {
	id?: string;
	deezerCUID?: string;
	title?: string | null;
	duration?: number | null;
	previewUrl?: string | null;
	artists?: { name?: string | null }[] | null;
	artist?: { name?: string | null }[] | null;
	album?: {
		cover?: string | null;
		coverMedium?: string | null;
		coverSmall?: string | null;
		CoverMedium?: string | null;
	} | null;
}

export const toPlayerTrack = (input: unknown): PlayerTrack | null => {
	if (!input || typeof input !== 'object') return null;

	const wrapper = input as { track?: TrackLike };
	const source: TrackLike | null | undefined = wrapper.track ?? (input as TrackLike);
	if (!source || typeof source !== 'object') return null;

	const title = firstName(source.title);
	const id = source.id ?? source.deezerCUID;
	if (!title || !id) return null;

	const artist = source.artists?.[0]?.name ?? source.artist?.[0]?.name ?? null;
	const cover = source.album?.coverMedium ?? source.album?.CoverMedium ?? source.album?.coverSmall ?? null;

	return {
		id,
		deezerCUID: firstName(source.deezerCUID),
		title,
		artist: firstName(artist) ?? 'Unknown artist',
		cover: firstName(cover),
		previewUrl: firstName(source.previewUrl),
		duration: typeof source.duration === 'number' && source.duration > 0 ? source.duration : 0,
	};
};

export const toPlayableQueue = (inputs: readonly unknown[]): PlayerTrack[] =>
	inputs.map(toPlayerTrack).filter((track): track is PlayerTrack => track !== null && track.previewUrl !== null);
