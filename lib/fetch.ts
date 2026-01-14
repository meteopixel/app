import { getApiUrl } from "@/constants/api";
import { navigate } from "expo-router/build/global-state/routing";
import { clearAuthData, storage } from "./storage";
import type {
	AuthUserInfo,
	Station,
	CreateStationInput,
	CreateStationOutput,
	UpdateStationInput,
	UpdateStationOutput,
	RegenerateTokenOutput,
	PgtypePoint,
	PgtypeText,
	PgtypeTimestamp,
	LatestMeasurementsResponse,
	MeasurementsResponse,
} from "./types";
import type { AuthProvider } from "@/constants/providers";

export const fetchAuthProviders = async (): Promise<AuthProvider[]> => {
	try {
		const response = await fetch(`${getApiUrl()}/auth/providers`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const providerNames: string[] = await response.json();
		// Transform array of strings to AuthProvider format
		return providerNames.map(name => ({ name }));
	} catch (error) {
		console.error('Error fetching auth providers:', error);
		throw error;
	}
};

// Transform backend station format to frontend format
function transformStation(backendStation: Station): Station {
	// Parse location from "(x,y)" string format
	let location: PgtypePoint | undefined;
	if (backendStation.Location) {
		const locStr = backendStation.Location.trim().replace(/[()]/g, '');
		const parts = locStr.split(',');
		if (parts.length === 2) {
			const x = parseFloat(parts[0].trim());
			const y = parseFloat(parts[1].trim());
			if (!isNaN(x) && !isNaN(y)) {
				location = {
					p: { x, y },
					valid: true,
				};
			} else {
				location = { valid: false };
			}
		} else {
			location = { valid: false };
		}
	}

	// Transform name to PgtypeText
	const name: PgtypeText | undefined = backendStation.Name
		? { string: backendStation.Name, valid: true }
		: undefined;

	// Transform CreatedAt to PgtypeTimestamp
	const createdAt: PgtypeTimestamp | undefined = backendStation.CreatedAt
		? { time: backendStation.CreatedAt, valid: true }
		: undefined;

	return {
		id: backendStation.ID,
		name,
		createdBy: backendStation.CreatedBy,
		location,
		createdAt,
		email: backendStation.Email,
		// Keep original fields for reference
		ID: backendStation.ID,
		Name: backendStation.Name,
		CreatedBy: backendStation.CreatedBy,
		Location: backendStation.Location,
		CreatedAt: backendStation.CreatedAt,
		Email: backendStation.Email,
	};
}

export const fetchUserInfo = async (): Promise<AuthUserInfo> => {
	const sessionToken = storage.getString("session_token");
	if (!sessionToken) {
		clearAuthData();
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
				clearAuthData()
				navigate("/(auth)")
			}
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const userData: AuthUserInfo = await response.json();
		return userData;
	} catch (error) {
		console.error('Error fetching user info:', error);
		throw error;
	}
};

export const fetchStations = async (): Promise<Station[]> => {
	const sessionToken = storage.getString("session_token");
	if (!sessionToken) {
		clearAuthData();
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
				clearAuthData()
				navigate("/(auth)")
			}
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const backendStations: Station[] = await response.json();
		// Transform backend format to frontend format
		return backendStations.map(transformStation);
	} catch (error) {
		console.error('Error fetching stations:', error);
		throw error;
	}
};

export const createStation = async (name: string, location: [number, number]): Promise<CreateStationOutput> => {
	const sessionToken = storage.getString("session_token");
	if (!sessionToken) {
		clearAuthData();
		navigate("/(auth)");
		throw new Error('No session token found');
	}

	const body: CreateStationInput = {
		name,
		location,
	};

	try {
		const response = await fetch(`${getApiUrl()}/station`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${sessionToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			if (response.status == 401 || response.status == 403) {
				clearAuthData()
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

export const updateStation = async (id: string, name?: string, location?: [number, number]): Promise<UpdateStationOutput> => {
	const sessionToken = storage.getString("session_token");
	if (!sessionToken) {
		clearAuthData();
		navigate("/(auth)");
		throw new Error('No session token found');
	}

	const body: UpdateStationInput = {};
	if (name !== undefined) body.name = name;
	if (location !== undefined) body.location = location;

	try {
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
				clearAuthData()
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
		clearAuthData();
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
				clearAuthData()
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
		clearAuthData();
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
				clearAuthData()
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

export const fetchLatestMeasurements = async (stationId: string): Promise<LatestMeasurementsResponse> => {
	const sessionToken = storage.getString("session_token");
	if (!sessionToken) {
		clearAuthData();
		navigate("/(auth)");
		throw new Error('No session token found');
	}

	try {
		const response = await fetch(`${getApiUrl()}/station/${stationId}/measurement/latest`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${sessionToken}`,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			if (response.status == 401 || response.status == 403) {
				clearAuthData()
				navigate("/(auth)")
			}
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data: LatestMeasurementsResponse = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching latest measurements:', error);
		throw error;
	}
};

export const fetchMeasurements = async (
	stationId: string,
	from: string,
	to: string,
	interval: string,
	source?: 'station' | 'official'
): Promise<MeasurementsResponse> => {
	const sessionToken = storage.getString("session_token");
	if (!sessionToken) {
		clearAuthData();
		navigate("/(auth)");
		throw new Error('No session token found');
	}

	try {
		const url = new URL(`${getApiUrl()}/station/${stationId}/measurement`);
		url.searchParams.append('from', from);
		url.searchParams.append('to', to);
		url.searchParams.append('interval', interval);
		if (source) {
			url.searchParams.append('source', source);
		}

		const response = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${sessionToken}`,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			if (response.status == 401 || response.status == 403) {
				clearAuthData()
				navigate("/(auth)")
			}
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data: MeasurementsResponse = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching measurements:', error);
		throw error;
	}
};

// Re-export types for backward compatibility
export type { 
	userData, 
	station,
	CreateStationOutput,
	UpdateStationOutput,
	RegenerateTokenOutput,
	PgtypeText, 
	PgtypePoint, 
	PgtypeTimestamp, 
	PgtypeVec2 
} from "./types";
