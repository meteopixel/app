import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { storage } from '@/lib/storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';

export default function AuthCallback() {
	const params = useLocalSearchParams();

	useEffect(() => {
		const processCallback = async () => {
			try {
				let resp: string | undefined;
				
				// Handle both string and array responses
				if (params.resp) {
					resp = Array.isArray(params.resp) ? params.resp[0] : params.resp;
				}
				
				if (!resp) {
					console.error('No response parameter in callback');
					router.replace('/(auth)');
					return;
				}

				// Decode the base64 response
				const decodedResponse = atob(resp);
				const userinfo = JSON.parse(decodedResponse);
				
				if (!userinfo.session_token) {
					console.error('No session token in auth response');
					router.replace('/(auth)');
					return;
				}

				// Store auth data
				const user = {
					email: userinfo.email,
					id: userinfo.id,
					provider: userinfo.provider,
					role: userinfo.role
				};

				storage.set('userinfo', JSON.stringify(user));
				storage.set('session_token', userinfo.session_token);
				
				// Navigate to main app
				router.replace('/(tabs)');
			} catch (error) {
				console.error('Error processing auth callback:', error);
				router.replace('/(auth)');
			}
		};

		processCallback();
	}, [params]);

	return (
		<ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator size="large" />
			<ThemedText style={{ marginTop: 16 }}>Completing authentication...</ThemedText>
		</ThemedView>
	);
}

