import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Text } from '@/components/text';
import { transformMeasurementsForChart } from '@/lib/utils/measurements';
import type { MeasurementsBucket } from '@/lib/types';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 64; // Account for padding and y-axis labels

export interface TemperatureChartProps {
	data?: MeasurementsBucket[];
	height?: number;
}

export function TemperatureChart({ data, height = 180 }: TemperatureChartProps) {
	const chartData = transformMeasurementsForChart(data);

	if (!chartData || chartData.length === 0) {
		return (
			<View className="bg-bg-primary rounded-lg" style={{ height }}>
				<Text className="text-text-secondary text-center text-sm">No data available</Text>
			</View>
		);
	}

	// Calculate min and max for y-axis
	const values = chartData.map((d) => d.value).filter((v) => !isNaN(v));
	if (values.length === 0) {
		return (
			<View className="bg-bg-primary rounded-lg" style={{ height }}>
				<Text className="text-text-secondary text-center text-sm">No valid data</Text>
			</View>
		);
	}

	// Use fixed y-axis range like mockup: 0, 18, 28, 38
	const yAxisMin = 0;
	const yAxisMax = 38;

	// Calculate spacing to stretch chart across available width
	const dataPoints = chartData.length;
	const availableWidth = chartWidth - 40; // Account for initial/end spacing
	const spacing = dataPoints > 1 ? availableWidth / (dataPoints - 1) : availableWidth;

	return (
		<View className="bg-bg-primary rounded-lg">
			<View className="flex-row">
				{/* Chart */}
				<View className="flex-1">
					<LineChart
						data={chartData.map(d => ({ value: d.value }))}
						height={height}
						width={chartWidth}
						spacing={spacing}
						thickness={2}
						color="#ffffff"
						hideRules={true}
						hideYAxisText={true}
						yAxisColor="transparent"
						xAxisColor="transparent"
						xAxisLabelsHeight={0}
						xAxisLabelTextStyle={{ height: 0, opacity: 0 }}
						curved={false}
						areaChart={true}
						startFillColor="#58a6ff"
						endFillColor="#0d1117"
						startOpacity={0.4}
						endOpacity={0.05}
						initialSpacing={20}
						endSpacing={20}
						noOfSections={4}
						maxValue={yAxisMax}
						minValue={yAxisMin}
						hideDataPoints={true}
						showVerticalLines={false}
						showHorizontalLines={false}
						disableScroll={true}
						scrollAnimation={false}
					/>
				</View>
				{/* Y-axis labels on the right */}
				<View className="justify-between py-1" style={{ height: height }}>
					<Text className="text-xs text-text-secondary">38°</Text>
					<Text className="text-xs text-text-secondary">28°</Text>
					<Text className="text-xs text-text-secondary">18°</Text>
					<Text className="text-xs text-text-secondary">0°</Text>
				</View>
			</View>
			{/* X-axis labels */}
			<View className="flex-row justify-between px-2 -mt-2">
				<Text className="text-xs text-text-secondary">00:00</Text>
				<Text className="text-xs text-text-secondary">Now</Text>
			</View>
		</View>
	);
}
