import { useQuery } from '@tanstack/react-query';
import { fetchAuthProviders } from '../fetch';
import type { AuthProvider } from '@/constants/providers';

export const useAuthProviders = () => {
	return useQuery<AuthProvider[]>({
		queryKey: ['authProviders'],
		queryFn: fetchAuthProviders,
		// Refetch on mount to get latest providers
		refetchOnMount: true,
		// Refetch when window regains focus
		refetchOnWindowFocus: true,
		// Refetch on reconnect
		refetchOnReconnect: true,
		// Shorter stale time for auth providers (1 minute) since they might change
		staleTime: 1000 * 60,
	});
};

