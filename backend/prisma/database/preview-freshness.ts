
const PREVIEW_EXPIRY_PATTERN = /exp=(\d+)(?:~|&|$)/;

export const previewExpiryMs = (previewUrl: string | null | undefined): number | null => {
	if (!previewUrl) return null;

	const match = PREVIEW_EXPIRY_PATTERN.exec(previewUrl);
	if (!match) return null;

	const seconds = Number(match[1]);
	return Number.isFinite(seconds) ? seconds * 1000 : null;
};

export const isPreviewFresh = (previewUrl: string | null | undefined, now = Date.now()): boolean => {
	if (!previewUrl) return false;

	const expiry = previewExpiryMs(previewUrl);
	return expiry !== null && expiry > now;
};
