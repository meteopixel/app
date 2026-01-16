import { useQuery } from '@tanstack/react-query';
import { fetchMeasurements } from '../fetch';
import type { MeasurementsResponse } from '../types';

export const useMeasurements = (
	stationId: string | undefined,
	from: string,
	to: string,
	interval: string,
	source?: 'station' | 'official',
	refetchInterval?: number
) => {
	return useQuery<MeasurementsResponse>({
		queryKey: ['measurements', stationId, from, to, interval, source],
		queryFn: () => {
			if (!stationId) {
				throw new Error('Station ID is required');
			}
			return fetchMeasurements(stationId, from, to, interval, source);
		},
		enabled: !!stationId && !!from && !!to && !!interval,
		placeholderData: (previousData) => previousData,
		refetchOnMount: true,
		keepPreviousData: false,
		refetchInterval: refetchInterval,
	});
};
