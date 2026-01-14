import { Text } from '@/components/text';
import { PixelartIcon } from '@/components/ui/pixelart-icon';
import { getApiUrl } from '@/constants/api';
import '@/global.css';
import { useAuthProviders } from '@/lib/queries/useAuthProviders';
import { storage } from '@/lib/storage';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, TouchableOpacity, View } from 'react-native';


export default function LoginScreen() {
	// Callback handling is now done in /(auth)/callback.tsx
	const { data: authProviders, isLoading, refetch } = useAuthProviders();
	const [showCheckmark, setShowCheckmark] = useState(false);

	const handleLogin = async (providerName: string) => {
		let redirectUri: string;

		if (Platform.OS === 'web') {
			// On web, use the current origin + callback route
			const origin = typeof window !== 'undefined' ? window.location.origin : '';
			redirectUri = `${origin}/(auth)/callback`;
		} else {
			redirectUri = Linking.createURL('/(auth)/callback');
		}

		const authUrl = `${getApiUrl()}/auth/${providerName}?redirect_uri=${encodeURIComponent(redirectUri)}`;

		if (Platform.OS === 'web') {
			// On web, redirect in the same window
			window.location.href = authUrl;
		} else {
			// On native, use WebBrowser
			await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
		}
	};

	// Map of provider names to display names
	const providerDisplayNames: Record<string, string> = {
		'google': 'Google',
		'github': 'Github',
		'email': 'Email',
		'dev': 'Dev',
	};

	// Get display name for a provider, capitalizing first letter if not in map
	const getDisplayName = (providerName: string): string => {
		const lowerName = providerName.toLowerCase();
		if (providerDisplayNames[lowerName]) {
			return providerDisplayNames[lowerName];
		}
		// Capitalize first letter
		return providerName.charAt(0).toUpperCase() + providerName.slice(1).toLowerCase();
	};

	// Show all providers from the server, sorted alphabetically
	const displayProviders = authProviders
		?.slice()
		.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())) || [];

	if (isLoading) {
		return (
			<View className="flex-1 bg-bg-primary px-6 items-center justify-center">
				<ActivityIndicator size="large" color="#e6edf3" />
			</View>
		);
	}

	return (

		<View className="flex-1 bg-bg-primary px-6 items-center w-screen" style={{ position: 'relative' }}>
			<TouchableOpacity
				onPress={() => {
					// Clear onboarding flag so user can change server
					storage.remove('onboarding-done');
					router.replace('/(auth)/onboarding');
				}}
				className="absolute top-20 left-10 z-10 w-10 h-10 items-center justify-center"
				activeOpacity={0.8}
				style={{
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 1 },
					shadowOpacity: 0.18,
					shadowRadius: 1.0,
					elevation: 1,
				}}
			>
				{/* Pixel-style back icon */}
				<PixelartIcon name="arrow-left" size={48} color="#e6edf3" />
			</TouchableOpacity>
			<TouchableOpacity
				onPress={() => {
					refetch();
					setShowCheckmark(true);
					setTimeout(() => {
						setShowCheckmark(false);
					}, 1500);
				}}
				className="absolute top-20 z-10 w-5 h-5 items-center justify-center"
				activeOpacity={0.8}
				style={{
					right: 24,
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 1 },
					shadowOpacity: 0.18,
					shadowRadius: 1.0,
					elevation: 1,
				}}
			>
				{/* Pixel-style refresh icon or checkmark */}
				<PixelartIcon
					name={showCheckmark ? "check" : "reload"}
					size={24}
					color={showCheckmark ? "#3fb950" : "#e6edf3"}
				/>
			</TouchableOpacity>
			<View className="flex-1 absolute top-20 items-start">
				<Text className="text-5xl text-text-primary mb-2 text-left">
					Login or
				</Text>
				<Text className="text-5xl text-text-primary text-left">
					Signup
				</Text>
			</View>
			<View 
				className="gap-4 pb-8"
				style={{
					position: 'absolute',
					bottom: 0,
					left: 20,
					right: 20,
				}}
			>
				{displayProviders.map((provider) => {
					const displayName = getDisplayName(provider.name);
					return (
						<TouchableOpacity
							key={provider.name}
							onPress={() => handleLogin(provider.name)}
							className="w-full border-2 border-text-primary py-4 rounded-lg items-center justify-center bg-transparent"
							activeOpacity={0.8}
						>
							<Text className="text-text-primary text-2xl">
								{displayName}
							</Text>
						</TouchableOpacity>
					);
				})}
			</View>
		</View>

	);
}
