import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { useFonts } from '@/constants/font-loader';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { storage } from '@/lib/storage';
import { ActivityIndicator, View } from 'react-native';

export const unstable_settings = {
	anchor: '(tabs)',
};

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const { fontsLoaded } = useFonts();
	const isAuthenticated = storage.contains("session_token");
	const onboardingDone = storage.getString("onboarding-done") === 'true';


	let initialRoute: "/(auth)/onboarding" | "/(auth)" | "/(tabs)";
	if (!onboardingDone) {
		initialRoute = "/(auth)/onboarding";
	} else if (!isAuthenticated) {
		initialRoute = "/(auth)";
	} else {
		initialRoute = "/(tabs)";
	}

	if (!fontsLoaded) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d1117' }}>
				<ActivityIndicator size="large" color="#58a6ff" />
			</View>
		);
	}

	return (
		<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="(auth)" />
				<Stack.Screen name="(tabs)" />
			</Stack>
			<Redirect href={initialRoute} />
			<StatusBar style="auto" />
		</ThemeProvider>
	);
}
