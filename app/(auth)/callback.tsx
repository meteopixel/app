import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { storage } from '@/lib/storage';
import { queryClient } from '@/lib/query-client';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator } from 'react-native';

export default function AuthCallback() {
	const params = useLocalSearchParams();
	const hasProcessed = useRef(false);

	useEffect(() => {
		// Prevent multiple processing
		if (hasProcessed.current) return;

		const processCallback = async () => {
			hasProcessed.current = true;
			
			try {
				let resp: string | undefined;
				
				// Handle both string and array responses
				if (params.resp) {
					resp = Array.isArray(params.resp) ? params.resp[0] : params.resp;
				}
				
				if (!resp) {
					console.error('No response parameter in callback');
					hasProcessed.current = false;
					setTimeout(() => {
						try {
							router.replace('/(auth)');
						} catch (error) {
							console.error('Navigation error:', error);
						}
					}, 100);
					return;
				}

				// Decode the base64 response
				const decodedResponse = atob(resp);
				const userinfo = JSON.parse(decodedResponse);
				
				if (!userinfo.session_token) {
					console.error('No session token in auth response');
					hasProcessed.current = false;
					setTimeout(() => {
						try {
							router.replace('/(auth)');
						} catch (error) {
							console.error('Navigation error:', error);
						}
					}, 100);
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
				
				// Clear query cache to ensure fresh data
				queryClient.clear();
				
				// Wait a bit longer to ensure storage is written and root layout sees the change
				await new Promise(resolve => setTimeout(resolve, 200));
				
				// Navigate to main app with error handling
				try {
					router.replace('/(tabs)');
				} catch (error) {
					console.error('Navigation error:', error);
					// Retry after a short delay
					setTimeout(() => {
						try {
							router.replace('/(tabs)');
						} catch (retryError) {
							console.error('Navigation retry error:', retryError);
						}
					}, 100);
				}
			} catch (error) {
				console.error('Error processing auth callback:', error);
				hasProcessed.current = false;
				setTimeout(() => {
					try {
						router.replace('/(auth)');
					} catch (navError) {
						console.error('Navigation error:', navError);
					}
				}, 100);
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

