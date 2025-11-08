import { useQuery } from '@tanstack/react-query';
import { fetchStations } from '../fetch';
import type { Station } from '../types';

export const useStations = () => {
	return useQuery<Station[]>({
		queryKey: ['stations'],
		queryFn: fetchStations,
		// Use cached data immediately if available
		placeholderData: (previousData) => previousData,
		// Refetch in background after showing cached data
		refetchOnMount: true,
		// Keep previous data while refetching
		keepPreviousData: false,
	});
};

