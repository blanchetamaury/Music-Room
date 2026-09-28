export function getSessionSecret(): Uint8Array {
	const secret = process.env.SESSION_SECRET;
	if (!secret || secret.length < 32) {
		throw new Error('SESSION_SECRET must be set and at least 32 characters long');
	}
	return new TextEncoder().encode(secret);
}
