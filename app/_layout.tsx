import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { storage } from '@/lib/storage';
import { navigate } from 'expo-router/build/global-state/routing';

export const unstable_settings = {
	anchor: '(tabs)',
};

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const isAuthenticated = storage.contains("session_token");
	// if (isAuthenticated) {
	// 	return <Redirect href="/(tabs)" />;
	// }
	// return <Redirect href={isAuthenticated ? "/(tabs)" : "/(auth)/login"} />;

	return (
		<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
			<Stack>
				{!isAuthenticated ? (
					<Stack.Screen name="(auth)" />
				) : (
					<Stack.Screen name="(tabs)" />
				)}			</Stack>
			<StatusBar style="auto" />
		</ThemeProvider>
	);
}
