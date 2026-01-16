import { Text } from '@/components/text';
import { DEFAULT_API_URL } from '@/constants/api';
import { storage, clearAuthData } from '@/lib/storage';
import { queryClient } from '@/lib/query-client';
import { useUserInfo } from '@/lib/queries/useUserInfo';
import { router } from 'expo-router';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

export default function Account() {
	const { data: user, isLoading: loading, error } = useUserInfo();

	const handleLogout = async () => {
		// Clear user authentication data
		clearAuthData();
		// Clear React Query cache
		queryClient.clear();
		// Wait longer to ensure state is fully cleared
		await new Promise(resolve => setTimeout(resolve, 150));
		// Redirect to login with error handling
		try {
			router.replace('/(auth)');
		} catch (error) {
			console.error('Navigation error on logout:', error);
			// Retry after a short delay
			setTimeout(() => {
				try {
					router.replace('/(auth)');
				} catch (retryError) {
					console.error('Navigation retry error:', retryError);
				}
			}, 100);
		}
	};

	const handleDeleteAll = async () => {
		// Clear all app storage
		storage.clearAll();
		// Clear React Query cache
		queryClient.clear();
		// Small delay to ensure state is cleared
		await new Promise(resolve => setTimeout(resolve, 50));
		// Redirect to onboarding
		router.replace('/(auth)/onboarding');
	};

	return (
		<View className="flex-1 bg-bg-primary px-6">
			<View className="flex-1 mt-24 justify-start items-center">
				<Text className="text-6xl text-text-primary mb-4">
					Account
				</Text>
				{loading && !user ? (
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
