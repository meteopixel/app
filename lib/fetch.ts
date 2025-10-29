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
				navigate("/login")
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


export interface userData {
	id: string,
	email: string,
	role: string,
	provider: string
}
