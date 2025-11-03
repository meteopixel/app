import { createMMKV } from 'react-native-mmkv';
import { userData } from './fetch';


export const storage = createMMKV()


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
