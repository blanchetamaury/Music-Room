const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      success: false,
      message: data.message || `HTTP error ${response.status}`,
    };
  }

  return {
    success: true,
    data: data as T,
  };
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchApi<{ user_id: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ mail: email, password }),
      }),

    signup: (email: string, password: string, username: string) =>
      fetchApi<{ user_id: string }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ mail: email, password, username }),
      }),

    logout: () =>
      fetchApi<void>('/auth/logout', {
        method: 'POST',
      }),

    resetPassword: {
      request: (email: string) =>
        fetchApi<void>('/auth/reset-password/request', {
          method: 'POST',
          body: JSON.stringify({ mail: email }),
        }),

      verify: (email: string, code: string, password: string) =>
        fetchApi<void>('/auth/reset-password/verify', {
          method: 'POST',
          body: JSON.stringify({ mail: email, code, password }),
        }),
    },

    oauthFortyTwo: () => `${API_BASE_URL}/auth/oauth/oauth_fortytwo`,
  },
};

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}