import { calculateStatusColor } from '@/lib/utils/measurements';
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

export interface StatusIndicatorProps {
	lastSeen?: string;
	size?: number;
	isFetching?: boolean;
}

export function StatusIndicator({ lastSeen, size = 8, isFetching = false }: StatusIndicatorProps) {
	const color = calculateStatusColor(lastSeen);
	const pingScale = useRef(new Animated.Value(1)).current;
	const pingOpacity = useRef(new Animated.Value(0)).current;

	// Sonar ping animation when fetching
	useEffect(() => {
		if (isFetching) {
			// Reset values
			pingScale.setValue(1);
			pingOpacity.setValue(0.6);

			// Animate the ping outward
			Animated.parallel([
				Animated.timing(pingScale, {
					toValue: 3,
					duration: 600,
					useNativeDriver: true,
				}),
				Animated.timing(pingOpacity, {
					toValue: 0,
					duration: 600,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [isFetching, pingScale, pingOpacity]);

	const getColor = () => {
		switch (color) {
			case 'green':
				return '#3fb950';
			case 'orange':
				return '#f0883e';
			case 'red':
				return '#f85149';
			default:
				return '#f85149';
		}
	};

	const currentColor = getColor();

	return (
		<View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
			{/* Sonar ping circle */}
			<Animated.View
				style={{
					position: 'absolute',
					width: size,
					height: size,
					borderRadius: size / 2,
					borderWidth: 2,
					borderColor: currentColor,
					opacity: pingOpacity,
					transform: [{ scale: pingScale }],
				}}
			/>
			{/* Main indicator dot */}
			<View
				style={{
					width: size,
					height: size,
					backgroundColor: currentColor,
					borderRadius: 10,
				}}
			/>
		</View>
	);
}
