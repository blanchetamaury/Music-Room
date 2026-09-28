import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/fetcher/api/client';
import { storage } from '../lib/storage';
import { performFortyTwoOAuth } from '../rest/fortytwo';
import { performGoogleOAuth } from '../rest/google';
import { privateUser } from '../types/user/PrivateUser';

interface AuthContextType {
	user: privateUser | null;
	token: string | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (email: string, password: string, username: string) => Promise<{ email: string }>;
	logout: () => Promise<void>;
	refreshUser: () => Promise<void>;
	updateProfile: (profile: { username?: string; avatarUrl?: string | null }) => Promise<void>;
	oauthFortyTwo: () => Promise<void>;
	oauthGoogle: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [token, setToken] = useState<string | null>(null);
	const [user, setUser] = useState<privateUser | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	const applySession = useCallback(async (newToken: string, nextUser: privateUser) => {
		await storage.setToken(newToken);
		setToken(newToken);
		setUser(nextUser);
	}, []);

	const exchangeCode = useCallback(
		async (code: string) => {
			const response = await api.auth.exchangeSession(code);

			if (!response.success || !response.data) {
				throw new Error(response.message ?? 'Could not open the session');
			}

			await applySession(response.data.token, response.data.user);
		},
		[applySession]
	);

	const refreshUser = useCallback(async () => {
		const currentToken = await storage.getToken();
		if (!currentToken) return;

		const response = await api.user.me(currentToken);

		if (!response.success) {
			if (response.message?.includes('401')) {
				await storage.clearToken();
				setToken(null);
				setUser(null);
			}
			return;
		}

		if (response.data) {
			setUser(response.data);
		}
	}, []);

	useEffect(() => {
		let cancelled = false;

		const restore = async () => {
			try {
				const storedToken = await storage.getToken();
				if (!storedToken) return;

				const response = await api.user.me(storedToken);

				if (!cancelled && response.success && response.data) {
					setToken(storedToken);
					setUser(response.data);
				} else if (!cancelled) {
					await storage.clearToken();
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		void restore();

		return () => {
			cancelled = true;
		};
	}, []);

	const login = useCallback(
		async (mail: string, password: string) => {
			const response = await api.auth.login(mail, password);

			if (!response.success || !response.data) {
				throw new Error(response.message ?? 'Invalid email or password');
			}

			await exchangeCode(response.data.code);
		},
		[exchangeCode]
	);

	const register = useCallback(async (mail: string, password: string, username: string) => {
		const response = await api.auth.signup(mail, password, username);

		if (!response.success) {
			throw new Error(response.message ?? 'Registration failed');
		}

		return { email: mail };
	}, []);

	const logout = useCallback(async () => {
		try {
			await api.auth.logout(token ?? '');
		} catch {}

		await storage.clearToken();
		setToken(null);
		setUser(null);
	}, [token]);

	const updateProfile = useCallback(async (profile: { username?: string; avatarUrl?: string | null }) => {
		const currentToken = await storage.getToken();
		if (!currentToken) throw new Error('Not authenticated');

		const response = await api.user.updateMe(currentToken, profile);

		if (!response.success) {
			throw new Error(response.message ?? 'Could not update your profile');
		}

		if (response.data) setUser(response.data);
	}, []);

	const completeOAuth = useCallback(
		async (provider: () => Promise<string | null>) => {
			const code = await provider();

			if (!code) throw new Error('Authentication cancelled');

			await exchangeCode(code);
		},
		[exchangeCode]
	);

	const oauthFortyTwo = useCallback(() => completeOAuth(performFortyTwoOAuth), [completeOAuth]);
	const oauthGoogle = useCallback(() => completeOAuth(performGoogleOAuth), [completeOAuth]);

	const value = useMemo<AuthContextType>(
		() => ({
			user,
			token,
			loading,
			login,
			register,
			logout,
			refreshUser,
			updateProfile,
			oauthFortyTwo,
			oauthGoogle,
		}),
		[user, token, loading, login, register, logout, refreshUser, updateProfile, oauthFortyTwo, oauthGoogle]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
	}

	return context;
}
