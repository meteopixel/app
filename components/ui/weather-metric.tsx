import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/text';
import { PixelartIcon, type PixelartIconName } from '@/components/ui/pixelart-icon';

export interface WeatherMetricProps {
	label: string;
	value: number | undefined;
	unit: string;
	icon: PixelartIconName;
	iconRotation?: number; // Rotation in degrees
}

export function WeatherMetric({ label, value, unit, icon, iconRotation }: WeatherMetricProps) {
	const displayValue = value !== undefined && !isNaN(value) ? value.toFixed(1) : '--';

	return (
		<View className="bg-bg-secondary rounded-lg p-4 border border-border flex-1 min-w-[100px] items-center">
			<Text className="text-sm text-text-secondary mb-3">{label}</Text>
			<View style={iconRotation !== undefined ? { transform: [{ rotate: `${iconRotation}deg` }] } : undefined}>
				<PixelartIcon name={icon} size={28} color="#e6edf3" />
			</View>
			<Text className="text-2xl text-text-primary font-semibold mt-2">{displayValue}</Text>
			<Text className="text-sm text-text-secondary">{unit}</Text>
		</View>
	);
}
