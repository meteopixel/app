import React from 'react';
import { View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
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
			contentContainerStyle={{ gap: 12 }}
		>
			{weekData.map((bucket, index) => {
				const date = bucket.time ? new Date(bucket.time) : new Date();
				const dayAbbr = formatDayAbbreviation(date);
				const temp = bucket.temperature?.avg;
				const tempFormatted = formatTemperature(temp);

				return (
					<View key={index} className="bg-bg-secondary rounded-xl py-5 px-6 min-w-[90px] border border-border items-center">
						<ThemedText className="text-2xl text-text-primary font-semibold">{tempFormatted}</ThemedText>
						<ThemedText className="text-base text-text-secondary mt-2">{dayAbbr}</ThemedText>
					</View>
				);
			})}
		</ScrollView>
	);
}
