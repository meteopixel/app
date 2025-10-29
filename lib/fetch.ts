import { api_url } from "@/constants/api";
import { navigate } from "expo-router/build/global-state/routing";
import { storage } from "./storage";

export const fetchUserInfo = async () => {

	try {
		const response = await fetch(`${api_url}/user/info`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${storage.getString("session_token")}`,
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

export const fetchSensors = async () => {

	try {
		const response = await fetch(`${api_url}/sensor`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${storage.getString("session_token")}`,
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

		const sensors: sensor[] = await response.json();
		console.log(sensors)
		return sensors;
	} catch (error) {
		console.error('Error fetching user info:', error);
		throw error;
	}
};
export interface userData {
	id: string,
	email: string,
	role: string,
	provider: string
}
export interface sensor {
	ID: string,
	Name: string,
	CreatedBy: string,
	Location: string,
	CreatedAt: string,
	Email: string

}
