import { storage } from '@/lib/storage';
import { Stack } from 'expo-router';
import { useState } from 'react';

export default function AuthLayout() {
	// Determine initial screen based on onboarding state
	const [initialRoute] = useState(() => {
		const onboardingDone = storage.getString('onboarding-done') === 'true';
		return onboardingDone ? 'index' : 'onboarding';
	});

	return (
		<Stack 
			screenOptions={{ headerShown: false }}
			initialRouteName={initialRoute}
		>
			<Stack.Screen name="index" />
			<Stack.Screen name="onboarding" />
			<Stack.Screen name="callback" />
		</Stack>
	);
}
