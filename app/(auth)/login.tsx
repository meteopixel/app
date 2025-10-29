import { useEffect } from 'react';
import { Button, View, StyleSheet, Text } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { api_url } from '@/constants/api';
import { storage } from '@/lib/storage';


export default function LoginScreen() {
	useEffect(() => {
		const subscription = Linking.addEventListener('url', ({ url }) => {
			const { queryParams } = Linking.parse(url);

			if (queryParams) {
				// Store auth data and navigate to main app
				let userinfo = JSON.parse(atob(queryParams.resp))
				console.log(userinfo)
				let user = {
					email: userinfo.email,
					id: userinfo.id,
					provider: userinfo.provider,
					role: userinfo.role


				}
				storage.set('userinfo', JSON.stringify(user))
				storage.set('session_token', userinfo.session_token)
				router.replace('/(tabs)');
			}
		});

		return () => subscription.remove();
	}, []);

	const handleLogin = async () => {
		const redirectUri = Linking.createURL('/');
		const authUrl = `${api_url}/auth/dev?redirect_uri=${encodeURIComponent(redirectUri)}`;

		await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Login</Text>
			<Button title="Login" onPress={handleLogin} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	title: {
		fontSize: 24,
		marginBottom: 20,
	},
});
