import { renderHook, waitFor, act } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { useEventPosition } from './useEventPosition';

const requestPermission = Location.requestForegroundPermissionsAsync as jest.MockedFunction<
	typeof Location.requestForegroundPermissionsAsync
>;
const getCurrentPosition = Location.getCurrentPositionAsync as jest.MockedFunction<
	typeof Location.getCurrentPositionAsync
>;

const VENUE = { latitude: 48.8566, longitude: 2.3522 };

beforeEach(() => {
	jest.clearAllMocks();
	requestPermission.mockResolvedValue({ status: 'granted', granted: true, canAskAgain: true } as never);
	getCurrentPosition.mockResolvedValue({ coords: VENUE } as never);
});

describe('useEventPosition', () => {
	it('starts with no position and no error', () => {
		const { result } = renderHook(() => useEventPosition());
		expect(result.current.position).toBeNull();
		expect(result.current.error).toBeNull();
		expect(result.current.loading).toBe(false);
	});

	it('resolves the position once permission is granted', async () => {
		const { result } = renderHook(() => useEventPosition());

		let resolved: { latitude: number; longitude: number } | undefined;
		await act(async () => {
			resolved = await result.current.request();
		});

		expect(resolved).toEqual(VENUE);
		await waitFor(() => expect(result.current.position).toEqual(VENUE));
		expect(result.current.error).toBeNull();
	});

	it('reports a denied permission without throwing', async () => {
		requestPermission.mockResolvedValue({ status: 'denied', granted: false, canAskAgain: true } as never);
		const { result } = renderHook(() => useEventPosition());

		await act(async () => {
			expect(await result.current.request()).toBeUndefined();
		});

		expect(result.current.position).toBeNull();
		expect(result.current.error).toBe('Location permission denied');
	});

	it('distinguishes a blocked permission from a simple denial', async () => {
		requestPermission.mockResolvedValue({ status: 'denied', granted: false, canAskAgain: false } as never);
		const { result } = renderHook(() => useEventPosition());

		await act(async () => {
			await result.current.request();
		});

		expect(result.current.error).toBe('Location permission blocked in settings');
	});

	it('surfaces a lookup failure', async () => {
		getCurrentPosition.mockRejectedValue(new Error('GPS unavailable'));
		const { result } = renderHook(() => useEventPosition());

		await act(async () => {
			await result.current.request();
		});

		expect(result.current.position).toBeNull();
		expect(result.current.error).toBe('GPS unavailable');
	});

	it('reuses the cached position instead of prompting again', async () => {
		const { result } = renderHook(() => useEventPosition());

		await act(async () => {
			await result.current.request();
		});
		await act(async () => {
			await result.current.request();
		});

		expect(requestPermission).toHaveBeenCalledTimes(1);
		expect(getCurrentPosition).toHaveBeenCalledTimes(1);
	});
});
