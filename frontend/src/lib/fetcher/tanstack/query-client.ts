import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30_000,
			retry: 1,
		},
		mutations: {
			retry: 0,
		},
	},
});

declare global {
	interface Window {
		__TANSTACK_QUERY_CLIENT__?: import('@tanstack/query-core').QueryClient;
	}
}

if (typeof window !== 'undefined') {
	window.__TANSTACK_QUERY_CLIENT__ = queryClient;
}
