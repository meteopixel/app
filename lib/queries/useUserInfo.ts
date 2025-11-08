import { useQuery } from '@tanstack/react-query';
import { fetchUserInfo } from '../fetch';
import type { AuthUserInfo } from '../types';

export const useUserInfo = () => {
	return useQuery<AuthUserInfo>({
		queryKey: ['userInfo'],
		queryFn: fetchUserInfo,
		// Use cached data immediately if available
		placeholderData: (previousData) => previousData,
		// Refetch in background after showing cached data
		refetchOnMount: true,
		// Keep previous data while refetching
		keepPreviousData: false,
	});
};

