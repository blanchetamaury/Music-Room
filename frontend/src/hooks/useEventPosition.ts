import { useCallback, useState } from 'react';
import * as Location from 'expo-location';
import type { GeoPosition } from '@/src/types/event/MusicEvent';

type PositionState = {
	position: GeoPosition | null;
	loading: boolean;
	error: string | null;
	request: () => Promise<GeoPosition | undefined>;
};

const messageFor = (error: unknown): string =>
	error instanceof Error ? error.message : 'Unable to read your position';

export function useEventPosition(): PositionState {
	const [position, setPosition] = useState<GeoPosition | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const request = useCallback(async (): Promise<GeoPosition | undefined> => {
		if (position) return position;

		setLoading(true);
		setError(null);
		try {
			const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
			if (status !== Location.PermissionStatus.GRANTED) {
				setError(canAskAgain ? 'Location permission denied' : 'Location permission blocked in settings');
				return undefined;
			}

			const current = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.Balanced,
			});
			const next: GeoPosition = {
				latitude: current.coords.latitude,
				longitude: current.coords.longitude,
			};
			setPosition(next);
			return next;
		} catch (e) {
			setError(messageFor(e));
			return undefined;
		} finally {
			setLoading(false);
		}
	}, [position]);

	return { position, loading, error, request };
}
