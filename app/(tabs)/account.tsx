import { Text } from '@/components/text';
import { DEFAULT_API_URL } from '@/constants/api';
import { fetchUserInfo, userData } from '@/lib/fetch';
import { storage } from '@/lib/storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

export default function Account() {
	const [user, setUser] = useState<userData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadUser = async () => {
			try {
				const userData = await fetchUserInfo();
				setUser(userData);
			} catch (error) {
				console.error('Failed to load user:', error);
			} finally {
				setLoading(false);
			}
		};

		loadUser();
	}, []);

	const handleLogout = () => {
		// Clear user authentication data
		// MMKV doesn't have delete method, so we clear the specific keys by setting to undefined
		storage.remove('session_token');
		storage.remove('userinfo');
		// Redirect to login
		router.replace('/(auth)');
	};

	const handleDeleteAll = () => {
		// Clear all app storage
		storage.clearAll();
		// Redirect to onboarding
		router.replace('/(auth)/onboarding');
	};

	return (
		<View className="flex-1 bg-bg-primary px-6">
			<View className="flex-1 mt-24 justify-start items-center">
				<Text className="text-6xl text-text-primary mb-4">
					Account
				</Text>
				{loading ? (
					<View className="items-center mt-8">
						<ActivityIndicator size="large" color="#58a6ff" />
					</View>
				) : user ? (
					<View className="items-center mt-8">
						<Text className="text-text-secondary text-lg mb-4">
							Email • {user.email}
						</Text>
						<Text className="text-text-tertiary text-lg mb-4">
							Role • {user.role}
						</Text>						
						{(() => {
							const serverUrl = storage.getString('server-url');
							const displayServer = !serverUrl || serverUrl === DEFAULT_API_URL 
								? 'Cloud' 
								: serverUrl;
							return (
								<Text className="text-text-tertiary text-lg mb-4">
									Server • {displayServer}
								</Text>
							);
						})()}
						<Text className="text-text-tertiary text-lg mb-4">
							Provider • {user.provider} 
						</Text>
					</View>
				) : null}
			</View>

			<View className="w-full gap-4 pb-8">
				<TouchableOpacity
					onPress={handleLogout}
					className="w-full border-2 border-text-primary py-4 rounded-lg items-center justify-center bg-transparent"
					activeOpacity={0.8}
				>
					<Text className="text-text-primary text-2xl">
						Logout
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={handleDeleteAll}
					className="w-full border-2 border-error py-4 rounded-lg items-center justify-center bg-transparent"
					activeOpacity={0.8}
				>
					<Text className="text-error text-2xl">
						Delete All Data
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}
