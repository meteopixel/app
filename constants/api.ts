import { storage } from '@/lib/storage';

export const DEFAULT_API_URL = "http://10.1.0.47:8080";

// Get API URL from storage or use default
// This function reads from storage each time, so changes apply immediately
export function getApiUrl(): string {
	return storage.getString('server-url') || DEFAULT_API_URL;
}
