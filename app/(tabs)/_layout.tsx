import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { PixelartIcon } from '@/components/ui/pixelart-icon';
import { Fonts } from '@/constants/fonts';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isAdmin } from '@/lib/storage';

export default function TabLayout() {
	const colorScheme = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarLabelStyle: {
					fontFamily: Fonts.pixelify,
				},
			}}>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Home',
					tabBarIcon: ({ color }) => <PixelartIcon name="home" size={28} color={color} />,
				}}
			/>{isAdmin() && <Tabs.Screen
				name="stations"
				options={{
					title: 'Stations',
					tabBarIcon: ({ color }) => <PixelartIcon name="devices" size={28} color={color} />,
				}}
			/>
			}

			<Tabs.Screen
				name="account"
				options={{
					title: 'Account',
					tabBarIcon: ({ color }) => <PixelartIcon name="user" size={28} color={color} />,
				}}
			/>
		</Tabs>
	);
}
