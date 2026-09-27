import axios from 'axios';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { storage } from '../lib/storage';
import { performFortyTwoOAuth } from '../rest/fortytwo';
import { performGoogleOAuth } from '../rest/google';
import { privateUser } from '../types/user/PrivateUser';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface AuthContextType {
	user: privateUser | null;
	token: string | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
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

	async function checkToken() {
		try {
			const storedToken = await storage.getItem('session');

			if (!storedToken) {
				setToken(null);
				setUser(null);
				setLoading(false);
				return;
			}

			const res = await axios.get(`${API_URL}/user/me`, {
				headers: { Authorization: `Bearer ${storedToken}` },
			});

			setToken(storedToken);
			setUser(res.data.data);
		} catch {
			await storage.deleteItem('session');
			setToken(null);
			setUser(null);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		checkToken();
	}, []);

	const login = async (mail: string, password: string) => {
		const res = await axios.post(`${API_URL}/auth/login`, { mail, password });
		await storage.setItem('session', res.data.token);
		setToken(res.data.token);
		setUser(res.data.user);
	};

	const oauthFortyTwo = async () => {
		const token = await performFortyTwoOAuth();
		if (!token) throw new Error('OAuth failed');

		await storage.setItem('session', token);
		setToken(token);

		const res = await axios.get(`${API_URL}/user/me`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		setUser(res.data.user);
	};

	const oauthGoogle = async () => {
		const token = await performGoogleOAuth();
		if (!token) throw new Error('OAuth failed');

		await storage.setItem('session', token);
		setToken(token);

		const res = await axios.get(`${API_URL}/user/me`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		setUser(res.data.user);
	};

	const register = async (mail: string, password: string) => {
		const res = await axios.post(`${API_URL}/auth/register`, { mail, password });
		await storage.setItem('session', res.data.token);
		setToken(res.data.token);
		setUser(res.data.user);
	};

	const logout = async () => {
		await storage.deleteItem('session');
		setToken(null);
		setUser(null);
	};

	const updateProfile = async (profile: { username?: string; avatarUrl?: string | null }) => {
		if (!token) throw new Error('Not authenticated');
		const response = await axios.patch(`${API_URL}/user/me`, profile, {
			headers: { Authorization: `Bearer ${token}` },
		});
		setUser(response.data.data);
	};

	return (
		<AuthContext.Provider
			value={{ token, user, loading, login, register, logout, updateProfile, oauthFortyTwo, oauthGoogle }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth(): AuthContextType {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
	}
	return context;
}
