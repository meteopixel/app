import { Text } from '@/components/text';
import { PixelartIcon } from '@/components/ui/pixelart-icon';
import { getApiUrl } from '@/constants/api';
import { authProviders } from '@/constants/providers';
import '@/global.css';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';


export default function LoginScreen() {
	// Callback handling is now done in /(auth)/callback.tsx

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

	// Filter and order providers to match mockup (Google, Github, Email)
	const displayProviders = authProviders
		.filter(provider => ['google', 'github', 'email', 'dev'].includes(provider.name.toLowerCase()))
		.sort((a, b) => {
			const order = ['google', 'github', 'email', 'dev'];
			return order.indexOf(a.name.toLowerCase()) - order.indexOf(b.name.toLowerCase());
		});

	return (

		<View className="flex-1 bg-bg-primary px-6 items-center justify-center">
			<TouchableOpacity
				onPress={() => router.replace('/(auth)/onboarding')}
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
			<View className="flex-1 mt-24 items-start">
				<Text className="text-5xl text-text-primary mb-2 text-left">
					Login or
				</Text>
				<Text className="text-5xl text-text-primary text-left">
					Signup
				</Text>
			</View>

			<View className="w-full gap-4 pb-8">
				{displayProviders.map((provider) => {
					const displayName = providerDisplayNames[provider.name.toLowerCase()] || provider.name;
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
