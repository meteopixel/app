import { createMMKV } from 'react-native-mmkv'
import { userData } from './fetch'


export const storage = createMMKV()


export function isAdmin() {
	let userInfo: userData = JSON.parse(storage.getString("userinfo"))
	return userInfo.role == "admin"
}
