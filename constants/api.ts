import { storage } from '@/lib/storage';

export const DEFAULT_API_URL = "https://api-meteopixel.thesven.dev";

// Refresh interval for latest measurements (in seconds)
export const LATEST_MEASUREMENTS_REFRESH_INTERVAL = 5;

// Get API URL from storage or use default
// This function reads from storage each time, so changes apply immediately
export function getApiUrl(): string {
	return storage.getString('server-url') || DEFAULT_API_URL;
}
