import React from 'react';
import { View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { PixelartIcon } from '@/components/ui/pixelart-icon';
import { formatDayAbbreviation, formatTemperature } from '@/lib/utils/measurements';
import type { MeasurementsBucket } from '@/lib/types';

export interface PastWeekForecastProps {
	data?: MeasurementsBucket[];
}

export function PastWeekForecast({ data }: PastWeekForecastProps) {
	if (!data || data.length === 0) {
		return (
			<View className="py-4">
				<ThemedText className="text-text-secondary text-center py-5 text-sm">
					No data available
				</ThemedText>
			</View>
		);
	}

	// Take last 7 days (or available data)
	const weekData = data.slice(-7);

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={{ gap: 8 }}
		>
			{weekData.map((bucket, index) => {
				const date = bucket.time ? new Date(bucket.time) : new Date();
				const dayAbbr = formatDayAbbreviation(date);
				const temp = bucket.temperature?.avg;
				const tempFormatted = formatTemperature(temp);

				// Simple logic: if temp > 15, show sun, else show cloud
				const iconName = temp && temp > 15 ? 'sun' : 'cloud-moon';
				const iconColor = temp && temp > 15 ? '#ffa94d' : '#7db9de';

				return (
					<View key={index} className="bg-bg-secondary rounded-lg py-3 px-4 min-w-[70px] border border-border items-center">
						<ThemedText className="text-base text-text-primary font-semibold">{tempFormatted}</ThemedText>
						<PixelartIcon name={iconName} size={20} color={iconColor} style={{ marginVertical: 4 }} />
						<ThemedText className="text-xs text-text-secondary">{dayAbbr}</ThemedText>
					</View>
				);
			})}
		</ScrollView>
	);
}
