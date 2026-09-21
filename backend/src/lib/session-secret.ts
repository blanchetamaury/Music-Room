const SESSION_SECRET_FALLBACK = 'fvsdvsdvoewfk3i4r4i5t984-0qwkdpwekopdp34rf3j4fijr';

export function getSessionSecret(): Uint8Array {
	return new TextEncoder().encode(process.env.SESSION_SECRET || SESSION_SECRET_FALLBACK);
}