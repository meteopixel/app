import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { PixelartIcon } from '@/components/ui/pixelart-icon';
import { ColorScheme } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { isAdmin } from '@/lib/storage';

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: ColorScheme['accent-primary'],
				tabBarInactiveTintColor: ColorScheme['text-secondary'],
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarLabelStyle: {
					fontFamily: Fonts.pixelify,
				},
				tabBarStyle: {
					backgroundColor: ColorScheme['bg-secondary'],
					borderTopColor: ColorScheme['border'],
					borderTopWidth: 1,
				},
			}}>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Home',
					tabBarIcon: ({ color }) => <PixelartIcon name="home" size={28} color={color} />,
				}}
			/><Tabs.Screen
				name="stations"
				redirect={!isAdmin()}
				options={{
					title: 'Stations',
					tabBarIcon: ({ color }) => <PixelartIcon name="devices" size={28} color={color} />,
				}}
			/>
			

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
