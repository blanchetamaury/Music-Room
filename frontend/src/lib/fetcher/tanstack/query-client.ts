import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30_000,
			retry: 1,
		},
	},
});

declare global {
	interface Window {
		__TANSTACK_QUERY_CLIENT__: import('@tanstack/query-core').QueryClient;
	}
}

// This code is for all users
window.__TANSTACK_QUERY_CLIENT__ = queryClient;
