const EARTH_RADIUS_M = 6371000;

export interface GeoPoint {
	latitude: number;
	longitude: number;
}

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

export const isValidGeoPoint = (point: Partial<GeoPoint> | null | undefined): point is GeoPoint => {
	if (!point) return false;
	const { latitude, longitude } = point as GeoPoint;
	if (typeof latitude !== 'number' || typeof longitude !== 'number') return false;
	if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;
	if (latitude < -90 || latitude > 90) return false;
	if (longitude < -180 || longitude > 180) return false;
	return true;
};

export const haversineDistanceMeters = (from: GeoPoint, to: GeoPoint): number => {
	const dLat = toRadians(to.latitude - from.latitude);
	const dLon = toRadians(to.longitude - from.longitude);
	const lat1 = toRadians(from.latitude);
	const lat2 = toRadians(to.latitude);

	const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

	return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));
};

export const isWithinRadius = (from: GeoPoint, to: GeoPoint, radiusMeters: number): boolean =>
	haversineDistanceMeters(from, to) <= radiusMeters;

export interface TimeWindow {
	startAt: Date | null;
	endAt: Date | null;
}

export type TimeWindowState = 'NO_WINDOW' | 'NOT_STARTED' | 'NOT_ENDED' | 'WITHIN_WINDOW';

export const evaluateTimeWindow = (window: TimeWindow, now: Date = new Date()): TimeWindowState => {
	if (!window.startAt && !window.endAt) return 'NO_WINDOW';
	if (window.startAt && now < window.startAt) return 'NOT_STARTED';
	if (window.endAt && now > window.endAt) return 'NOT_ENDED';
	return 'WITHIN_WINDOW';
};

export const isWithinTimeWindow = (window: TimeWindow, now: Date = new Date()): boolean =>
	evaluateTimeWindow(window, now) === 'WITHIN_WINDOW';
