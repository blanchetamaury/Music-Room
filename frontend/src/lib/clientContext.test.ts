const mockStore = new Map<string, string>();

jest.mock('./storage', () => ({
	storage: {
		getItem: jest.fn(async (key: string) => mockStore.get(key) ?? null),
		setItem: jest.fn(async (key: string, value: string) => {
			mockStore.set(key, value);
		}),
	},
	getCsrfToken: () => null,
}));

const KEY = 'install_device_id';

type ClientContextModule = typeof import('./clientContext');

const load = (os: 'ios' | 'android' | 'web', version: string | null = '2.3.4'): ClientContextModule => {
	jest.resetModules();
	jest.doMock('react-native', () => ({ Platform: { OS: os } }));
	jest.doMock('expo-constants', () => ({
		__esModule: true,
		default: { expoConfig: version === null ? null : { version } },
	}));
	return require('./clientContext') as ClientContextModule;
};

beforeEach(() => mockStore.clear());

describe('clientAuditHeaders', () => {
	it('always sends the platform and the app version, even before init', () => {
		const mod = load('ios');
		const headers = mod.clientAuditHeaders();
		expect(headers['X-Client-Platform']).toBe('ios');
		expect(headers['X-App-Version']).toBe('2.3.4');
		expect(headers['X-Device-Id']).toBeUndefined();
		expect(headers['X-Device-Model']).toBeUndefined();
	});

	it('adds the device id and model once initialised', async () => {
		const mod = load('android');
		await mod.initClientContext();
		const headers = mod.clientAuditHeaders();
		expect(headers['X-Device-Id']).toEqual(expect.any(String));
		expect(headers['X-Device-Id']!.length).toBeGreaterThan(0);
		expect(headers['X-Device-Model']).toBe('android');
	});

	it('never sends the literal string "undefined"', async () => {
		const mod = load('web');
		expect(Object.values(mod.clientAuditHeaders())).not.toContain('undefined');
		await mod.initClientContext();
		expect(Object.values(mod.clientAuditHeaders())).not.toContain('undefined');
	});

	it('falls back to "unknown" when the app version cannot be read', () => {
		expect(load('ios', null).clientAuditHeaders()['X-App-Version']).toBe('unknown');
	});

	it('persists the device id so the audit log can tell sessions apart', async () => {
		const mod = load('ios');
		const first = await mod.initClientContext();
		expect(mockStore.get(KEY)).toBe(first.deviceId);

		const reloaded = load('ios');
		const second = await reloaded.initClientContext();
		expect(second.deviceId).toBe(first.deviceId);
	});

	it('is idempotent when init runs twice', async () => {
		const mod = load('ios');
		const a = await mod.initClientContext();
		const b = await mod.initClientContext();
		expect(b.deviceId).toBe(a.deviceId);
	});
});
