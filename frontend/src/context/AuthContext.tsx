import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { storage } from '../lib/storage';
import { performFortyTwoOAuth } from '../rest/fortytwo';
import { performGoogleOAuth } from '../rest/google';

const API_URL = 'http://localhost:3000/api';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  oauthFortyTwo: () => Promise<void>;
  oauthGoogle: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
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
      setUser(res.data.user);
    } catch (error) {
      await storage.deleteItem('session');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

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
  };

  const oauthGoogle = async () => {
    const token = await performGoogleOAuth();
    if (!token) throw new Error('OAuth failed');

    await storage.setItem('session', token);
    setToken(token);
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

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout, oauthFortyTwo, oauthGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}