import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	createStation,
	updateStation,
	deleteStation,
	regenerateStationToken,
} from '../fetch';
import type {
	CreateStationOutput,
	UpdateStationOutput,
	RegenerateTokenOutput,
} from '../types';

export const useCreateStation = () => {
	const queryClient = useQueryClient();

	return useMutation<CreateStationOutput, Error, { name: string; location: [number, number] }>({
		mutationFn: ({ name, location }) => createStation(name, location),
		onSuccess: () => {
			// Invalidate stations query to trigger refetch
			queryClient.invalidateQueries({ queryKey: ['stations'] });
		},
	});
};

export const useUpdateStation = () => {
	const queryClient = useQueryClient();

	return useMutation<
		UpdateStationOutput,
		Error,
		{ id: string; name?: string; location?: [number, number] }
	>({
		mutationFn: ({ id, name, location }) => updateStation(id, name, location),
		onSuccess: () => {
			// Invalidate stations query to trigger refetch
			queryClient.invalidateQueries({ queryKey: ['stations'] });
		},
	});
};

export const useDeleteStation = () => {
	const queryClient = useQueryClient();

	return useMutation<boolean, Error, string>({
		mutationFn: (id: string) => deleteStation(id),
		onSuccess: () => {
			// Invalidate stations query to trigger refetch
			queryClient.invalidateQueries({ queryKey: ['stations'] });
		},
	});
};

export const useRegenerateToken = () => {
	const queryClient = useQueryClient();

	return useMutation<RegenerateTokenOutput, Error, string>({
		mutationFn: (id: string) => regenerateStationToken(id),
		onSuccess: () => {
			// Invalidate stations query to trigger refetch
			queryClient.invalidateQueries({ queryKey: ['stations'] });
		},
	});
};

