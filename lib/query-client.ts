import { QueryClient } from '@tanstack/react-query';
import { navigate } from 'expo-router/build/global-state/routing';
import { storage } from './storage';

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Data is considered fresh for 5 minutes
			staleTime: 1000 * 60 * 5,
			// Cache data for 24 hours
			gcTime: 1000 * 60 * 60 * 24,
			// Retry failed requests once
			retry: 1,
			// Refetch on window focus
			refetchOnWindowFocus: true,
			// Refetch on reconnect
			refetchOnReconnect: true,
		},
		mutations: {
			// Retry failed mutations once
			retry: 1,
		},
	},
});

// Global error handler for queries
queryClient.getQueryCache().subscribe((event) => {
	if (event?.type === 'error') {
		const error = event?.error as any;
		// Handle auth errors globally
		if (error?.status === 401 || error?.status === 403) {
			storage.clearAll();
			navigate('/(auth)');
		}
	}
});

