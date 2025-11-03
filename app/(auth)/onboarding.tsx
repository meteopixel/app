import { Text } from '@/components/text';
import { DEFAULT_API_URL } from '@/constants/api';
import '@/global.css';
import { storage } from '@/lib/storage';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, TextInput, TouchableOpacity, View } from 'react-native';

export default function OnboardingScreen() {
	const [showServerModal, setShowServerModal] = useState(false);
	const [serverUrl, setServerUrl] = useState('');

	const handleGetStarted = () => {
		// Save default server URL if not already saved
		const savedServerUrl = storage.getString('server-url');
		if (!savedServerUrl) {
			storage.set('server-url', DEFAULT_API_URL);
		}
		
		// Mark onboarding as done
		storage.set('onboarding-done', 'true');
		
		// Navigate to auth screen
		router.replace('/(auth)');
	};

	const handleChooseServer = () => {
		setShowServerModal(true);
	};

	const handleSaveServer = () => {
		const trimmedUrl = serverUrl.trim();
		
		if (!trimmedUrl) {
			Alert.alert('Error', 'Please enter a valid server URL');
			return;
		}

		// Basic URL validation
		if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
			Alert.alert('Error', 'Server URL must start with http:// or https://');
			return;
		}

		// Save server URL
		storage.set('server-url', trimmedUrl);
		
		// Mark onboarding as done
		storage.set('onboarding-done', 'true');
		
		// Close modal and navigate
		setShowServerModal(false);
		router.replace('/(auth)');
	};

	const handleCancelServer = () => {
		setShowServerModal(false);
		setServerUrl('');
	};

	return (
		<View className="flex-1 bg-bg-primary px-6">
			<View className="flex-1 mt-24 justify-start items-center">
				<Text className="text-6xl text-text-primary">
					MeteoPixel
				</Text>
			</View>

			<View className="w-full gap-4 pb-8">
				<TouchableOpacity
					onPress={handleGetStarted}
					className="w-full bg-accent-primary py-4 rounded-lg items-center justify-center"
					activeOpacity={0.8}
				>
					<Text className="text-text-primary text-2xl">
						Get Started
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={handleChooseServer}
					className="w-full border-2 border-text-primary py-4 rounded-lg items-center justify-center bg-transparent"
					activeOpacity={0.8}
				>
					<Text className="text-text-primary text-2xl">
						Choose Server
					</Text>
				</TouchableOpacity>
			</View>

			<Modal
				visible={showServerModal}
				transparent={true}
				animationType="fade"
				onRequestClose={handleCancelServer}
			>
				<View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
					<View className="bg-bg-secondary rounded-lg p-6 w-full max-w-sm border border-border">
						<Text className="text-text-primary text-xl mb-4 text-center">
							Choose Server
						</Text>
						
						<TextInput
							value={serverUrl}
							onChangeText={setServerUrl}
							placeholder="Enter server URL (e.g., http://127.0.0.1:8080)"
							placeholderTextColor="#8b95a8"
							className="bg-bg-tertiary text-text-primary px-4 py-3 rounded-lg mb-4 border border-border"
							autoCapitalize="none"
							autoCorrect={false}
							keyboardType="url"
						/>

						<View className="flex-row gap-3">
							<TouchableOpacity
								onPress={handleCancelServer}
								className="flex-1 border-2 border-border py-3 rounded-lg items-center justify-center"
								activeOpacity={0.8}
							>
								<Text className="text-text-primary">
									Cancel
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								onPress={handleSaveServer}
								className="flex-1 bg-accent-primary py-3 rounded-lg items-center justify-center"
								activeOpacity={0.8}
							>
								<Text className="text-text-primary">
									Save
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}

