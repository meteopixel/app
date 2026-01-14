import { useQuery } from '@tanstack/react-query';
import { LATEST_MEASUREMENTS_REFRESH_INTERVAL } from '@/constants/api';
import { fetchLatestMeasurements } from '../fetch';
import type { LatestMeasurementsResponse } from '../types';

export const useLatestMeasurements = (stationId: string | undefined) => {
	return useQuery<LatestMeasurementsResponse>({
		queryKey: ['latestMeasurements', stationId],
		queryFn: () => {
			if (!stationId) {
				throw new Error('Station ID is required');
			}
			return fetchLatestMeasurements(stationId);
		},
		enabled: !!stationId,
		refetchInterval: LATEST_MEASUREMENTS_REFRESH_INTERVAL * 1000, // Convert seconds to ms
		refetchOnMount: true,
		staleTime: 0,
		gcTime: 0,
	});
};
