import {
	PersistedClient,
	Persister,
} from '@tanstack/react-query-persist-client';
import { storage } from './storage';

const QUERY_CACHE_KEY = 'react-query-cache';

/**
 * Creates an MMKV persister for TanStack Query
 * @see https://tanstack.com/query/latest/docs/react/plugins/persistQueryClient
 */
export const mmkvPersister: Persister = {
	persistClient: async (client: PersistedClient): Promise<void> => {
		try {
			const serialized = JSON.stringify(client);
			storage.set(QUERY_CACHE_KEY, serialized);
		} catch (error) {
			console.error('Error persisting query client to MMKV:', error);
		}
	},
	restoreClient: async (): Promise<PersistedClient | undefined> => {
		try {
			const cached = storage.getString(QUERY_CACHE_KEY);
			if (!cached) {
				return undefined;
			}
			return JSON.parse(cached) as PersistedClient;
		} catch (error) {
			console.error('Error restoring query client from MMKV:', error);
			return undefined;
		}
	},
	removeClient: async (): Promise<void> => {
		try {
			storage.remove(QUERY_CACHE_KEY);
		} catch (error) {
			console.error('Error removing query client from MMKV:', error);
		}
	},
};

