jest.mock('expo-location', () => ({
	Accuracy: { Balanced: 3, High: 4 },
	PermissionStatus: { GRANTED: 'granted', DENIED: 'denied', UNDETERMINED: 'undetermined' },
	requestForegroundPermissionsAsync: jest.fn(async () => ({
		status: 'granted',
		granted: true,
		canAskAgain: true,
	})),
	getCurrentPositionAsync: jest.fn(async () => ({
		coords: { latitude: 48.8566, longitude: 2.3522 },
	})),
}));

jest.mock('expo-secure-store', () => ({
	getItemAsync: jest.fn(async () => null),
	setItemAsync: jest.fn(async () => undefined),
	deleteItemAsync: jest.fn(async () => undefined),
}));

jest.spyOn(console, 'warn').mockImplementation((...args) => {
	const first = String(args[0] ?? '');
	if (first.includes('useNativeDriver') || first.includes('VirtualizedList')) return;
	console.info(...args);
});
