import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	evaluateTimeWindow,
	haversineDistanceMeters,
	isValidGeoPoint,
	isWithinRadius,
	isWithinTimeWindow,
} from './geo';

const PARIS = { latitude: 48.8566, longitude: 2.3522 };
const MARSEILLE = { latitude: 43.2965, longitude: 5.3698 };

describe('isValidGeoPoint', () => {
	it('accepts a well-formed point', () => {
		assert.equal(isValidGeoPoint(PARIS), true);
		assert.equal(isValidGeoPoint({ latitude: -33.8688, longitude: 151.2093 }), true);
	});

	it('rejects missing, null and undefined input', () => {
		assert.equal(isValidGeoPoint(null), false);
		assert.equal(isValidGeoPoint(undefined), false);
		assert.equal(isValidGeoPoint({}), false);
		assert.equal(isValidGeoPoint({ latitude: 48.8566 }), false);
		assert.equal(isValidGeoPoint({ longitude: 2.3522 }), false);
	});

	it('rejects non-numeric and non-finite coordinates', () => {
		assert.equal(isValidGeoPoint({ latitude: '48.85', longitude: 2.35 } as never), false);
		assert.equal(isValidGeoPoint({ latitude: NaN, longitude: 2.35 }), false);
		assert.equal(isValidGeoPoint({ latitude: 48.85, longitude: Infinity }), false);
		assert.equal(isValidGeoPoint({ latitude: 0, longitude: 0 }), true);
	});

	it('enforces the coordinate ranges', () => {
		assert.equal(isValidGeoPoint({ latitude: 90, longitude: 180 }), true);
		assert.equal(isValidGeoPoint({ latitude: -90, longitude: -180 }), true);
		assert.equal(isValidGeoPoint({ latitude: 90.1, longitude: 0 }), false);
		assert.equal(isValidGeoPoint({ latitude: -90.1, longitude: 0 }), false);
		assert.equal(isValidGeoPoint({ latitude: 0, longitude: 180.1 }), false);
		assert.equal(isValidGeoPoint({ latitude: 0, longitude: -180.1 }), false);
	});
});

describe('haversineDistanceMeters', () => {
	it('is zero for identical points', () => {
		assert.equal(haversineDistanceMeters(PARIS, PARIS), 0);
	});

	it('matches the known Paris -> Marseille distance (~660 km)', () => {
		const distance = haversineDistanceMeters(PARIS, MARSEILLE);
		assert.ok(Math.abs(distance - 660_000) < 10_000, `expected ~660km, got ${distance}`);
	});

	it('is symmetric', () => {
		assert.equal(haversineDistanceMeters(PARIS, MARSEILLE), haversineDistanceMeters(MARSEILLE, PARIS));
	});

	it('computes a quarter of the circumference along the equator', () => {
		const distance = haversineDistanceMeters({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 90 });
		assert.ok(Math.abs(distance - (Math.PI / 2) * 6_371_000) < 1, `got ${distance}`);
	});
});

describe('isWithinRadius', () => {
	it('includes the boundary itself', () => {
		const distance = haversineDistanceMeters(PARIS, MARSEILLE);
		assert.equal(isWithinRadius(PARIS, MARSEILLE, distance), true);
		assert.equal(isWithinRadius(PARIS, MARSEILLE, distance - 1), false);
	});

	it('rejects a point just outside the radius', () => {
		const nearby = { latitude: 48.8666, longitude: 2.3522 };
		assert.equal(isWithinRadius(PARIS, nearby, 100), false);
		assert.equal(isWithinRadius(PARIS, nearby, 5000), true);
	});
});

describe('evaluateTimeWindow', () => {
	const now = new Date('2026-01-15T12:00:00.000Z');
	const before = new Date('2026-01-15T10:00:00.000Z');
	const after = new Date('2026-01-15T14:00:00.000Z');

	it('reports NO_WINDOW when neither bound is set', () => {
		assert.equal(evaluateTimeWindow({ startAt: null, endAt: null }, now), 'NO_WINDOW');
	});

	it('reports NOT_STARTED before the opening', () => {
		assert.equal(evaluateTimeWindow({ startAt: after, endAt: null }, now), 'NOT_STARTED');
	});

	it('reports NOT_ENDED after the closing', () => {
		assert.equal(evaluateTimeWindow({ startAt: null, endAt: before }, now), 'NOT_ENDED');
	});

	it('reports WITHIN_WINDOW on the open-ended side', () => {
		assert.equal(evaluateTimeWindow({ startAt: before, endAt: null }, now), 'WITHIN_WINDOW');
		assert.equal(evaluateTimeWindow({ startAt: null, endAt: after }, now), 'WITHIN_WINDOW');
	});

	it('treats both bounds as inclusive', () => {
		assert.equal(evaluateTimeWindow({ startAt: now, endAt: now }, now), 'WITHIN_WINDOW');
		assert.equal(evaluateTimeWindow({ startAt: before, endAt: after }, now), 'WITHIN_WINDOW');
	});

	it('reports NOT_STARTED when both bounds are in the future', () => {
		assert.equal(evaluateTimeWindow({ startAt: after, endAt: after }, now), 'NOT_STARTED');
	});

	it('reports NOT_ENDED when both bounds are in the past', () => {
		assert.equal(evaluateTimeWindow({ startAt: before, endAt: before }, now), 'NOT_ENDED');
	});
});

describe('isWithinTimeWindow', () => {
	const now = new Date('2026-01-15T12:00:00.000Z');

	it('is false when the window has not been set', () => {
		assert.equal(evaluateTimeWindow({ startAt: null, endAt: null }, now), 'NO_WINDOW');
		assert.equal(isWithinTimeWindow({ startAt: null, endAt: null }, now), false);
	});

	it('is true only for an open window', () => {
		assert.equal(
			isWithinTimeWindow(
				{ startAt: new Date('2026-01-15T11:00:00Z'), endAt: new Date('2026-01-15T13:00:00Z') },
				now
			),
			true
		);
		assert.equal(isWithinTimeWindow({ startAt: new Date('2026-01-15T13:00:00Z'), endAt: null }, now), false);
	});
});
