import { Text } from '@/components/text';
import type { MeasurementsBucket } from '@/lib/types';
import React from 'react';
import { Dimensions, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 64;

export type MetricKey = 'temperature' | 'humidity' | 'pressure' | 'windSpeed' | 'windDirection';

export interface MetricChartProps {
	stationData?: MeasurementsBucket[];
	officialData?: MeasurementsBucket[];
	metricKey: MetricKey;
	label: string;
	unit: string;
	height?: number;
	fromTime?: string;
	toTime?: string;
	stationColor?: string;
	officialColor?: string;
}

interface DataPoint {
	value: number;
	time: number;
}

function extractDataPoints(data: MeasurementsBucket[] | undefined, metricKey: MetricKey): DataPoint[] {
	if (!data) return [];
	
	return data
		.map((bucket) => {
			const metric = bucket[metricKey];
			const value = metric?.avg;
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
		.filter((d): d is DataPoint => d !== null)
		.sort((a, b) => a.time - b.time);
}

function formatTimeLabel(date: Date, rangeHours: number): string {
	if (rangeHours <= 24) {
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	} else if (rangeHours <= 24 * 7) {
		return date.toLocaleDateString([], { weekday: 'short', day: 'numeric' });
	} else {
		return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
	}
}

export function MetricChart({
	stationData,
	officialData,
	metricKey,
	label,
	unit,
	height = 180,
	fromTime,
	toTime,
	stationColor = '#58a6ff',
	officialColor = '#f97316',
}: MetricChartProps) {
	const now = toTime ? new Date(toTime) : new Date();
	const startTime = fromTime ? new Date(fromTime) : (() => {
		const midnight = new Date(now);
		midnight.setHours(0, 0, 0, 0);
		return midnight;
	})();

	const stationPoints = extractDataPoints(stationData, metricKey);
	const officialPoints = extractDataPoints(officialData, metricKey);

	const allPoints = [...stationPoints, ...officialPoints];

	if (allPoints.length === 0) {
		return (
			<View className="bg-bg-secondary rounded-lg p-4 mb-4">
				<Text className="text-text-primary text-base mb-2">{label}</Text>
				<View style={{ height: height / 2 }} className="justify-center">
					<Text className="text-text-secondary text-center text-sm">No data available</Text>
				</View>
			</View>
		);
	}

	// Calculate y-axis range from all data
	const dataMin = Math.min(...allPoints.map(d => d.value));
	const dataMax = Math.max(...allPoints.map(d => d.value));
	
	const range = dataMax - dataMin;
	const padding = Math.min(Math.max(range * 0.15, 2), 5);
	
	let yAxisMin = dataMin - padding;
	let yAxisMax = dataMax + padding;
	
	const roundToNice = (value: number, roundUp: boolean): number => {
		const step = range < 10 ? 2 : 5;
		return roundUp ? Math.ceil(value / step) * step : Math.floor(value / step) * step;
	};
	
	yAxisMin = roundToNice(yAxisMin, false);
	yAxisMax = roundToNice(yAxisMax, true);
	
	// Ensure minimum range
	const minRange = metricKey === 'temperature' ? 8 : (metricKey === 'humidity' ? 20 : 10);
	if (yAxisMax - yAxisMin < minRange) {
		const center = dataMin === dataMax ? dataMin : (dataMin + dataMax) / 2;
		yAxisMin = roundToNice(center - minRange / 2, false);
		yAxisMax = roundToNice(center + minRange / 2, true);
	}

	const yRange = yAxisMax - yAxisMin;
	const timeRange = now.getTime() - startTime.getTime();
	const rangeHours = timeRange / (1000 * 60 * 60);

	// Prepare chart data for station
	const prepareChartData = (points: DataPoint[], color: string) => {
		if (points.length === 0) return { data: [], spacing: 0, initialOffset: 0 };
		
		const chartData = points.map(p => ({
			value: p.value - yAxisMin,
		}));

		const availableWidth = chartWidth - 40;
		const firstPointRatio = (points[0].time - startTime.getTime()) / timeRange;
		const initialOffset = firstPointRatio * availableWidth;

		let spacing = availableWidth;
		if (points.length > 1) {
			const lastPointTime = points[points.length - 1].time;
			const dataTimeRange = lastPointTime - points[0].time;
			spacing = (dataTimeRange / timeRange) * availableWidth / (points.length - 1);
		}

		return { data: chartData, spacing, initialOffset };
	};

	const stationChart = prepareChartData(stationPoints, stationColor);
	const officialChart = prepareChartData(officialPoints, officialColor);

	// Generate y-axis labels
	const yAxisLabels: number[] = [];
	for (let i = 0; i <= 4; i++) {
		const value = yAxisMin + yRange * (i / 4);
		yAxisLabels.push(Math.round(value));
	}
	const yAxisLabelsReversed = [...yAxisLabels].reverse();

	// Time labels
	const startLabel = formatTimeLabel(startTime, rangeHours);
	const endLabel = formatTimeLabel(now, rangeHours);

	// Determine which data to show and if we need a legend
	const showStation = stationPoints.length > 0;
	const showOfficial = officialPoints.length > 0;
	const showLegend = showStation && showOfficial;

	return (
		<View className="bg-bg-secondary rounded-lg p-4 mb-4">
			<View className="flex-row justify-between items-center mb-2">
				<Text className="text-text-primary text-base">{label}</Text>
				{showLegend && (
					<View className="flex-row items-center gap-3">
						<View className="flex-row items-center gap-1">
							<View style={{ width: 12, height: 3, backgroundColor: stationColor, borderRadius: 1 }} />
							<Text className="text-text-secondary text-xs">Station</Text>
						</View>
						<View className="flex-row items-center gap-1">
							<View style={{ width: 12, height: 3, backgroundColor: officialColor, borderRadius: 1 }} />
							<Text className="text-text-secondary text-xs">Official</Text>
						</View>
					</View>
				)}
			</View>

			<View className="flex-row">
				<View className="flex-1 overflow-hidden">
					{/* Render station data first (as area chart) */}
					{showStation && (
						<LineChart
							data={stationChart.data}
							height={height}
							width={chartWidth}
							spacing={stationChart.spacing}
							thickness={2}
							color={stationColor}
							hideRules={false}
							rulesType="solid"
							rulesColor="#0d1117"
							rulesThickness={1}
							hideYAxisText={true}
							yAxisColor="transparent"
							xAxisColor="#0d1117"
							xAxisThickness={1}
							xAxisLabelsHeight={0}
							xAxisLabelTextStyle={{ height: 0, opacity: 0 }}
							curved={false}
							areaChart={true}
							startFillColor={stationColor}
							endFillColor="#0d1117"
							startOpacity={0.3}
							endOpacity={0.05}
							initialSpacing={stationChart.initialOffset + 20}
							endSpacing={20}
							noOfSections={4}
							maxValue={yRange}
							hideDataPoints={true}
							disableScroll={true}
						/>
					)}
					{/* Render official data overlay */}
					{showOfficial && (
						<View style={{ position: showStation ? 'absolute' : 'relative', top: 0, left: 0 }}>
							<LineChart
								data={officialChart.data}
								height={height}
								width={chartWidth}
								spacing={officialChart.spacing}
								thickness={2}
								color={officialColor}
								hideRules={showStation}
								rulesType="solid"
								rulesColor="#0d1117"
								rulesThickness={1}
								hideYAxisText={true}
								yAxisColor="transparent"
								xAxisColor={showStation ? "transparent" : "#0d1117"}
								xAxisThickness={1}
								xAxisLabelsHeight={0}
								xAxisLabelTextStyle={{ height: 0, opacity: 0 }}
								curved={false}
								areaChart={!showStation}
								startFillColor={officialColor}
								endFillColor="#0d1117"
								startOpacity={0.3}
								endOpacity={0.05}
								initialSpacing={officialChart.initialOffset + 20}
								endSpacing={20}
								noOfSections={4}
								maxValue={yRange}
								hideDataPoints={true}
								disableScroll={true}
							/>
						</View>
					)}
				</View>
				<View className="justify-between py-1" style={{ height: height }}>
					{yAxisLabelsReversed.map((value, index) => (
						<Text key={`y-label-${value}-${index}`} className="text-xs text-text-secondary">
							{value}{unit}
						</Text>
					))}
				</View>
			</View>
			<View className="flex-row justify-between px-2 -mt-2">
				<Text className="text-xs text-text-secondary">{startLabel}</Text>
				<Text className="text-xs text-text-secondary">{endLabel}</Text>
			</View>
		</View>
	);
}
