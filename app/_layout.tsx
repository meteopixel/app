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
	const redirectingRef = useRef(false);
	const [isReady, setIsReady] = useState(false);

	// Current location info
	const isOnAuthGroup = segments[0] === "(auth)";
	const isOnTabsGroup = segments[0] === "(tabs)";
	const isOnCallback = isOnAuthGroup && segments[1] === "callback";
	const isOnOnboarding = isOnAuthGroup && segments[1] === 'onboarding';
	const isOnLoginScreen = isOnAuthGroup && !segments[1] && !isOnCallback && !isOnOnboarding;
	const isAuthenticated = storage.contains("session_token");

	// Handle navigation - only for auth boundary protection
	useEffect(() => {
		// Wait for navigation to be ready and have segments (layout mounted)
		if (!navigationState?.key || segments.length === 0) return;
		
		// Don't interfere with callback or onboarding - they handle their own navigation
		if (isOnCallback || isOnOnboarding) {
			redirectingRef.current = false;
			return;
		}

		// Safe navigation helper
		const safeNavigate = (route: string) => {
			if (redirectingRef.current) return;
			
			try {
				redirectingRef.current = true;
				// Use requestAnimationFrame for safer navigation timing
				if (typeof requestAnimationFrame !== 'undefined') {
					requestAnimationFrame(() => {
						try {
							router.replace(route as any);
						} catch (error) {
							console.error('Navigation error:', error);
						} finally {
							// Reset after a delay to allow navigation to complete
							setTimeout(() => {
								redirectingRef.current = false;
							}, 100);
						}
					});
				} else {
					// Fallback for environments without requestAnimationFrame
					setTimeout(() => {
						try {
							router.replace(route as any);
						} catch (error) {
							console.error('Navigation error:', error);
						} finally {
							setTimeout(() => {
								redirectingRef.current = false;
							}, 100);
						}
					}, 10);
				}
			} catch (error) {
				console.error('Navigation setup error:', error);
				redirectingRef.current = false;
			}
		};

		// Mark initial navigation as done and set ready
		if (!hasInitialNavigated.current) {
			hasInitialNavigated.current = true;
			setIsReady(true);
			// On initial load, redirect authenticated users to tabs
			if (isAuthenticated && !isOnTabsGroup) {
				safeNavigate("/(tabs)");
			}
			return;
		}

		// Prevent redirect loops - don't redirect if we're already redirecting
		if (redirectingRef.current) {
			return;
		}

		// After initial load, only protect auth boundaries:
		// - Protect tabs: redirect to login if not authenticated
		// - Redirect to tabs if authenticated and on login screen only
		
		if (isOnTabsGroup && !isAuthenticated) {
			// User is on tabs but not authenticated - redirect to auth
			safeNavigate("/(auth)");
			return;
		}

		// Only redirect from login screen if authenticated
		if (isAuthenticated && isOnLoginScreen) {
			safeNavigate("/(tabs)");
			return;
		}

		// Reset redirecting flag if we're on the correct screen
		if ((isOnTabsGroup && isAuthenticated) || (isOnAuthGroup && !isAuthenticated)) {
			redirectingRef.current = false;
		}

	}, [navigationState?.key, isOnCallback, isOnTabsGroup, isOnAuthGroup, isOnLoginScreen, isOnOnboarding, isAuthenticated]);

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
