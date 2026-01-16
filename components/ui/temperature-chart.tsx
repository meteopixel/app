import { Text } from '@/components/text';
import type { MeasurementsBucket } from '@/lib/types';
import React from 'react';
import { Dimensions, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 64; // Account for padding and y-axis labels

export interface TemperatureChartProps {
	data?: MeasurementsBucket[];
	height?: number;
	fromTime?: string; // ISO string for start of time range (00:00)
	toTime?: string; // ISO string for end of time range (Now)
}

export function TemperatureChart({ data, height = 180, fromTime, toTime }: TemperatureChartProps) {
	// Calculate time range
	const now = toTime ? new Date(toTime) : new Date();
	const startTime = fromTime ? new Date(fromTime) : (() => {
		const midnight = new Date(now);
		midnight.setHours(0, 0, 0, 0);
		return midnight;
	})();
	
	// Extract valid data points with timestamps
	const dataPoints = (data || [])
		.map((bucket) => {
			const value = bucket.temperature?.avg;
			if (value === undefined || value === null || isNaN(value)) {
				return null;
			}
			const time = bucket.time ? new Date(bucket.time) : null;
			if (!time) return null;
			
			return {
				value,
				time: time.getTime(),
			};
		})
		.filter((d): d is { value: number; time: number } => d !== null)
		.sort((a, b) => a.time - b.time);

	if (dataPoints.length === 0) {
		return (
			<View className="bg-bg-primary rounded-lg" style={{ height }}>
				<Text className="text-text-secondary text-center text-sm">No valid data</Text>
			</View>
		);
	}

	// Calculate y-axis range from actual data
	const dataMin = Math.min(...dataPoints.map(d => d.value));
	const dataMax = Math.max(...dataPoints.map(d => d.value));
	
	// Add padding
	const range = dataMax - dataMin;
	const padding = Math.min(Math.max(range * 0.15, 2), 5);
	
	let yAxisMin = dataMin - padding;
	let yAxisMax = dataMax + padding;
	
	// Round to nice numbers
	const roundToNice = (value: number, roundUp: boolean): number => {
		const step = range < 10 ? 2 : 5;
		return roundUp ? Math.ceil(value / step) * step : Math.floor(value / step) * step;
	};
	
	yAxisMin = roundToNice(yAxisMin, false);
	yAxisMax = roundToNice(yAxisMax, true);
	
	// Ensure minimum range of 8 degrees
	if (yAxisMax - yAxisMin < 8) {
		const center = dataMin === dataMax ? dataMin : (dataMin + dataMax) / 2;
		yAxisMin = roundToNice(center - 4, false);
		yAxisMax = roundToNice(center + 4, true);
	}

	// Adjust values relative to yAxisMin so the chart displays correctly
	// The chart library draws from 0 to maxValue, so we offset values
	const yRange = yAxisMax - yAxisMin;
	const chartData = dataPoints.map(p => ({
		value: p.value - yAxisMin, // Shift so yAxisMin becomes 0
	}));

	// Generate y-axis labels (these show the real values)
	const yAxisLabels: number[] = [];
	for (let i = 0; i <= 4; i++) {
		const value = yAxisMin + yRange * (i / 4);
		yAxisLabels.push(Math.round(value));
	}
	const yAxisLabelsReversed = [...yAxisLabels].reverse();

	// Calculate position of first data point within the time range
	const timeRange = now.getTime() - startTime.getTime();
	const firstPointTime = dataPoints[0].time;
	const firstPointRatio = (firstPointTime - startTime.getTime()) / timeRange;
	
	// Calculate spacing between actual data points
	const availableWidth = chartWidth - 40;
	const initialOffset = firstPointRatio * availableWidth;
	
	// Spacing between consecutive points
	let spacing = availableWidth;
	if (dataPoints.length > 1) {
		const lastPointTime = dataPoints[dataPoints.length - 1].time;
		const dataTimeRange = lastPointTime - firstPointTime;
		spacing = (dataTimeRange / timeRange) * availableWidth / (dataPoints.length - 1);
	}

	return (
		<View className="bg-bg-primary rounded-lg">
			<View className="flex-row">
				<View className="flex-1">
					<LineChart
						data={chartData}
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
						initialSpacing={initialOffset + 20}
						endSpacing={20}
						noOfSections={4}
						maxValue={yRange}
						hideDataPoints={true}
						disableScroll={true}
					/>
				</View>
				<View className="justify-between py-1" style={{ height: height }}>
					{yAxisLabelsReversed.map((label, index) => (
						<Text key={`y-label-${label}-${index}`} className="text-xs text-text-secondary">
							{label}°
						</Text>
					))}
				</View>
			</View>
			<View className="flex-row justify-between px-2 -mt-2">
				<Text className="text-xs text-text-secondary">00:00</Text>
				<Text className="text-xs text-text-secondary">Now</Text>
			</View>
		</View>
	);
}
