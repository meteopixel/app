import { getApiUrl } from "@/constants/api";
import { navigate } from "expo-router/build/global-state/routing";
import { storage } from "./storage";

export const fetchUserInfo = async () => {
	const sessionToken = storage.getString("session_token");
	if (!sessionToken) {
		storage.clearAll();
		navigate("/(auth)");
		throw new Error('No session token found');
	}

	try {
		const response = await fetch(`${getApiUrl()}/user/info`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${sessionToken}`,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			if (response.status == 401 || response.status == 403) {
				storage.clearAll()
				navigate("/(auth)")
			}
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const userData: userData = await response.json();
		return userData;
	} catch (error) {
		console.error('Error fetching user info:', error);
		throw error;
	}
};

export const fetchStations = async () => {
	const sessionToken = storage.getString("session_token");
	if (!sessionToken) {
		storage.clearAll();
		navigate("/(auth)");
		throw new Error('No session token found');
	}

	try {
		const response = await fetch(`${getApiUrl()}/station`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${sessionToken}`,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			if (response.status == 401 || response.status == 403) {
				storage.clearAll()
				navigate("/(auth)")
			}
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const stations: station[] = await response.json();
		return stations;
	} catch (error) {
		console.error('Error fetching stations:', error);
		throw error;
	}
};

export const createStation = async (name: string, location: [number, number]) => {
	const sessionToken = storage.getString("session_token");
	if (!sessionToken) {
		storage.clearAll();
		navigate("/(auth)");
		throw new Error('No session token found');
	}

	try {
		const response = await fetch(`${getApiUrl()}/station`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${sessionToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name,
				location,
			}),
		});

		if (!response.ok) {
			if (response.status == 401 || response.status == 403) {
				storage.clearAll()
				navigate("/(auth)")
			}
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result: CreateStationOutput = await response.json();
		return result;
	} catch (error) {
		console.error('Error creating station:', error);
		throw error;
	}
};

export const updateStation = async (id: string, name?: string, location?: [number, number]) => {
	const sessionToken = storage.getString("session_token");
	if (!sessionToken) {
		storage.clearAll();
		navigate("/(auth)");
		throw new Error('No session token found');
	}

	try {
		const body: any = {};
		if (name !== undefined) body.name = name;
		if (location !== undefined) body.location = location;

		const response = await fetch(`${getApiUrl()}/station/${id}`, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${sessionToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			if (response.status == 401 || response.status == 403) {
				storage.clearAll()
				navigate("/(auth)")
			}
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result: UpdateStationOutput = await response.json();
		return result;
	} catch (error) {
		console.error('Error updating station:', error);
		throw error;
	}
};

export const deleteStation = async (id: string) => {
	const sessionToken = storage.getString("session_token");
	if (!sessionToken) {
		storage.clearAll();
		navigate("/(auth)");
		throw new Error('No session token found');
	}

	try {
		const response = await fetch(`${getApiUrl()}/station/${id}`, {
			method: 'DELETE',
			headers: {
				'Authorization': `Bearer ${sessionToken}`,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			if (response.status == 401 || response.status == 403) {
				storage.clearAll()
				navigate("/(auth)")
			}
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return true;
	} catch (error) {
		console.error('Error deleting station:', error);
		throw error;
	}
};

export const regenerateStationToken = async (id: string) => {
	const sessionToken = storage.getString("session_token");
	if (!sessionToken) {
		storage.clearAll();
		navigate("/(auth)");
		throw new Error('No session token found');
	}

	try {
		const response = await fetch(`${getApiUrl()}/station/${id}/regenerate-token`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${sessionToken}`,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			if (response.status == 401 || response.status == 403) {
				storage.clearAll()
				navigate("/(auth)")
			}
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result: RegenerateTokenOutput = await response.json();
		return result;
	} catch (error) {
		console.error('Error regenerating station token:', error);
		throw error;
	}
};

export interface userData {
	id: string,
	email: string,
	role: string,
	provider: string
}

export interface pgtypeText {
	string: string,
	valid: boolean
}

export interface pgtypePoint {
	p: {
		x: number,
		y: number
	},
	valid: boolean
}

export interface pgtypeTimestamp {
	time: string,
	valid: boolean,
	infinityModifier?: number
}

export interface station {
	id: string,
	name: pgtypeText,
	createdBy: string,
	location: pgtypePoint,
	createdAt: pgtypeTimestamp,
	email: string
}

export interface CreateStationOutput {
	id: string,
	name: string,
	api_key: string
}

export interface UpdateStationOutput {
	id: string,
	name: string,
	location: [number, number]
}

export interface RegenerateTokenOutput {
	id: string,
	name: string,
	api_key: string
}
