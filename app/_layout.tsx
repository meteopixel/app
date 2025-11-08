import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import '../global.css';

import { useFonts } from '@/constants/font-loader';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { storage } from '@/lib/storage';
import { queryClient } from '@/lib/query-client';
import { mmkvPersister } from '@/lib/query-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ActivityIndicator, View } from 'react-native';
import { useEffect, useState, useRef } from 'react';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
	anchor: '(tabs)',
};

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const { fontsLoaded } = useFonts();
	const segments = useSegments();
	
	// Check auth state synchronously at startup to avoid flash
	// This runs once during component initialization, before first render
	const [authState, setAuthState] = useState(() => {
		const isAuthenticated = storage.contains("session_token");
		const onboardingDone = storage.getString("onboarding-done") === 'true';
		return { isAuthenticated, onboardingDone, isInitialized: true };
	});

	// Determine initial route based on auth state
	// This is calculated synchronously from the initial state, so no flash occurs
	const initialRoute: "/(auth)/onboarding" | "/(auth)" | "/(tabs)" = (() => {
		if (!authState.onboardingDone) {
			return "/(auth)/onboarding";
		} else if (!authState.isAuthenticated) {
			return "/(auth)";
		} else {
			return "/(tabs)";
		}
	})();

	// Check if we're on the correct route based on segments
	const expectedSegment = initialRoute.replace(/[()]/g, '').split('/').filter(Boolean)[0];
	const isOnCorrectRoute = segments.length > 0 && (
		segments[0] === expectedSegment ||
		(initialRoute === "/(tabs)" && segments[0] === "tabs") ||
		(initialRoute === "/(auth)" && (segments[0] === "auth" || segments.length === 0)) ||
		(initialRoute === "/(auth)/onboarding" && segments[0] === "auth" && segments[1] === "onboarding")
	);

	// Hide splash screen only when everything is ready AND we're on the correct route
	useEffect(() => {
		if (!fontsLoaded || !authState.isInitialized) {
			return;
		}

		// Wait until we're on the correct route before hiding splash
		if (!isOnCorrectRoute && segments.length === 0) {
			// Still initializing, wait a bit
			return;
		}

		async function hideSplash() {
			try {
				// Delay to ensure everything is rendered and navigation completed
				await new Promise(resolve => setTimeout(resolve, 200));
				await SplashScreen.hideAsync();
			} catch (e) {
				console.warn(e);
				await SplashScreen.hideAsync();
			}
		}

		// Only hide if we're on correct route or if we've waited long enough
		if (isOnCorrectRoute || segments.length > 0) {
			hideSplash();
		}
	}, [fontsLoaded, authState.isInitialized, isOnCorrectRoute, segments]);

	// Re-check auth state when navigation segments change
	// This catches auth state changes after login
	useEffect(() => {
		const auth = storage.contains("session_token");
		const onboarding = storage.getString("onboarding-done") === 'true';
		setAuthState(prev => ({
			...prev,
			isAuthenticated: auth,
			onboardingDone: onboarding
		}));
	}, [segments]);

	// Don't render anything until fonts are loaded - keep splash visible
	if (!fontsLoaded || !authState.isInitialized) {
		return null;
	}

	return (
		<PersistQueryClientProvider
			client={queryClient}
			persistOptions={{ persister: mmkvPersister }}
		>
			<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen name="(auth)" />
					<Stack.Screen name="(tabs)" />
				</Stack>
				<Redirect href={initialRoute} />
				<StatusBar style="auto" />
			</ThemeProvider>
		</PersistQueryClientProvider>
	);
}
