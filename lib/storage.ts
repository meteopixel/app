import { createMMKV } from 'react-native-mmkv';
import { userData } from './fetch';


export const storage = createMMKV()

// Clear only auth-related data, preserving app settings like server-url and onboarding-done
export function clearAuthData() {
	storage.remove('session_token');
	storage.remove('userinfo');
	storage.remove('selectedStationId');
	// Clear any station-related cache but keep app settings
	const allKeys = storage.getAllKeys();
	for (const key of allKeys) {
		if (key.startsWith('stationLastSeen_')) {
			storage.remove(key);
		}
	}
}


export function isAdmin() {
	const userinfoString = storage.getString("userinfo");
	if (!userinfoString) {
		return false;
	}
	try {
		let userInfo: userData = JSON.parse(userinfoString);
		return userInfo.role == "admin";
	} catch (error) {
		console.error('Error parsing userinfo:', error);
		return false;
	}
}

export function getSelectedStationId(): string | undefined {
	return storage.getString("selectedStationId") || undefined;
}

export function setSelectedStationId(stationId: string): void {
	storage.set("selectedStationId", stationId);
}

export function getStationLastSeen(stationId: string): string | undefined {
	return storage.getString(`stationLastSeen_${stationId}`) || undefined;
}

export function setStationLastSeen(stationId: string, timestamp: string): void {
	storage.set(`stationLastSeen_${stationId}`, timestamp);
}
