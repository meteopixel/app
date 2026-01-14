import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack, useSegments, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { useFonts } from '@/constants/font-loader';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { queryClient } from '@/lib/query-client';
import { mmkvPersister } from '@/lib/query-persister';
import { storage } from '@/lib/storage';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useEffect, useRef, useState } from 'react';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
	anchor: '(tabs)',
};

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const { fontsLoaded } = useFonts();
	const segments = useSegments();
	const navigationState = useRootNavigationState();
	const hasInitialNavigated = useRef(false);
	const lastRedirectTarget = useRef<string | null>(null);
	const [isReady, setIsReady] = useState(false);

	// Current location info
	const isOnAuthGroup = segments[0] === "(auth)";
	const isOnTabsGroup = segments[0] === "(tabs)";
	const isOnCallback = isOnAuthGroup && segments[1] === "callback";
	const isAuthenticated = storage.contains("session_token");
	const segmentsKey = segments.join("/");

	// Handle navigation - only for auth boundary protection
	useEffect(() => {
		// Wait for navigation to be ready and have segments (layout mounted)
		if (!navigationState?.key || segments.length === 0) return;
		
		// Don't interfere with callback - it handles its own redirect
		if (isOnCallback) return;

		// Mark initial navigation as done and set ready
		if (!hasInitialNavigated.current) {
			hasInitialNavigated.current = true;
			setIsReady(true);
			// On initial load, redirect authenticated users to tabs
			if (isAuthenticated && !isOnTabsGroup) {
				lastRedirectTarget.current = "/(tabs)";
				setTimeout(() => router.replace("/(tabs)"), 0);
			}
			return;
		}

		// Clear last redirect target if we've arrived somewhere different
		if (lastRedirectTarget.current) {
			const arrivedAtTarget = 
				(lastRedirectTarget.current === "/(auth)" && isOnAuthGroup) ||
				(lastRedirectTarget.current === "/(tabs)" && isOnTabsGroup);
			if (arrivedAtTarget) {
				lastRedirectTarget.current = null;
			} else {
				// Still waiting for redirect to complete
				return;
			}
		}

		// After initial load, only protect auth boundaries:
		// - Protect tabs: redirect to login if not authenticated
		// - Redirect to tabs if authenticated and on login screen only (not onboarding)
		
		if (isOnTabsGroup && !isAuthenticated) {
			lastRedirectTarget.current = "/(auth)";
			setTimeout(() => router.replace("/(auth)"), 0);
			return;
		}

		// Only redirect from login screen, not from onboarding
		const isOnLoginScreen = isOnAuthGroup && !segments[1];
		if (isAuthenticated && isOnLoginScreen) {
			lastRedirectTarget.current = "/(tabs)";
			setTimeout(() => router.replace("/(tabs)"), 0);
			return;
		}

	}, [segmentsKey, navigationState?.key, isOnCallback, isOnTabsGroup, isOnAuthGroup, isAuthenticated]);

	// Hide splash screen only when fonts loaded AND we're on the correct screen
	useEffect(() => {
		if (!fontsLoaded || !navigationState?.key || !isReady) return;

		async function hideSplash() {
			try {
				await new Promise(resolve => setTimeout(resolve, 50));
				await SplashScreen.hideAsync();
			} catch (e) {
				console.warn(e);
				await SplashScreen.hideAsync();
			}
		}

		hideSplash();
	}, [fontsLoaded, navigationState?.key, isReady]);

	// Don't render anything until fonts are loaded
	if (!fontsLoaded) {
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
				<StatusBar style="auto" />
			</ThemeProvider>
		</PersistQueryClientProvider>
	);
}
