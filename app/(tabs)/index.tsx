import { Text } from '@/components/text';
import { PastWeekForecast } from '@/components/ui/past-week-forecast';
import { PixelTemperature } from '@/components/ui/pixel-temperature';
import { PixelartIcon } from '@/components/ui/pixelart-icon';
import { StationSelector } from '@/components/ui/station-selector';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { TemperatureChart } from '@/components/ui/temperature-chart';
import { WeatherMetric } from '@/components/ui/weather-metric';
import { useLatestMeasurements } from '@/lib/queries/useLatestMeasurements';
import { useMeasurements } from '@/lib/queries/useMeasurements';
import { useStations } from '@/lib/queries/useStations';
import { getSelectedStationId, setSelectedStationId } from '@/lib/storage';
import { formatDateTime } from '@/lib/utils/measurements';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';

// Refresh interval for chart data (in milliseconds) - less frequent than latest measurements
const CHART_REFRESH_INTERVAL = 30 * 1000; // 30 seconds

export default function HomeScreen() {
	const { data: stations, isLoading: stationsLoading } = useStations();
	const [selectedStationId, setSelectedStationIdState] = useState<string | undefined>(undefined);

	// Initialize selected station from storage or default to first station
	useEffect(() => {
		if (stations && Array.isArray(stations) && stations.length > 0) {
			const savedStationId = getSelectedStationId();
			if (savedStationId) {
				// Verify the saved station still exists
				const stationExists = stations.some(
					(s: typeof stations[0]) => s.id === savedStationId || s.ID === savedStationId
				);
				if (stationExists) {
					setSelectedStationIdState(savedStationId);
				} else {
					// Use first station if saved one doesn't exist
					const firstStation = stations[0];
					const firstStationId = firstStation?.id || firstStation?.ID;
					if (firstStationId) {
						setSelectedStationIdState(firstStationId);
						setSelectedStationId(firstStationId);
					}
				}
			} else {
				// No saved station, use first one
				const firstStation = stations[0];
				const firstStationId = firstStation?.id || firstStation?.ID;
				if (firstStationId) {
					setSelectedStationIdState(firstStationId);
					setSelectedStationId(firstStationId);
				}
			}
		}
	}, [stations]);

	const handleStationChange = (stationId: string) => {
		setSelectedStationIdState(stationId);
	};

	// Fetch latest measurements (auto-refreshes every X seconds)
	const { data: latestMeasurements, isLoading: latestLoading, isFetching: latestFetching } = useLatestMeasurements(selectedStationId);

	// Track current time and update it periodically to refresh chart data
	const [currentTime, setCurrentTime] = useState(new Date());

	// Update current time periodically to trigger chart data refresh
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(new Date());
		}, CHART_REFRESH_INTERVAL);

		return () => clearInterval(interval);
	}, []);

	// Calculate time ranges for charts (using currentTime so it updates)
	const now = currentTime;

	// Today from midnight (00:00) to now
	const todayMidnight = new Date(now);
	todayMidnight.setHours(0, 0, 0, 0);

	const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

	const fromToday = todayMidnight.toISOString();
	const toNow = now.toISOString();
	const from7d = sevenDaysAgo.toISOString();
	const to7d = now.toISOString();

	// Fetch today's data for chart (from 00:00 to now)
	const { data: chartData, isLoading: chartLoading } = useMeasurements(
		selectedStationId,
		fromToday,
		toNow,
		'1 hour',
		'station',
		CHART_REFRESH_INTERVAL
	);

	// Fetch 7-day data for past week (using station data)
	const { data: weekData, isLoading: weekLoading } = useMeasurements(
		selectedStationId,
		from7d,
		to7d,
		'1 day',
		'station',
		CHART_REFRESH_INTERVAL
	);

	// Get current temperature
	const currentTemp = latestMeasurements?.temprature?.station ?? latestMeasurements?.temprature?.official;

	// Get measurement timestamp from latest measurements (for status indicator and display)
	const lastMeasurementTime = latestMeasurements?.time;
	const measurementDateTime = lastMeasurementTime ? formatDateTime(lastMeasurementTime) : '--';

	// Get wind, humidity, pressure values
	const windSpeed = latestMeasurements?.wind?.speed?.station ?? latestMeasurements?.wind?.speed?.official;
	const windDirection = (((latestMeasurements?.wind?.direction?.station ?? latestMeasurements?.wind?.direction?.official ?? 0) - 90) % 360 + 360) % 360;
	const humidity = latestMeasurements?.humidity?.station ?? latestMeasurements?.humidity?.official;
	const pressure = latestMeasurements?.pressure?.station ?? latestMeasurements?.pressure?.official;

	if (stationsLoading) {
		return (
			<View className="flex-1 justify-center items-center bg-bg-primary gap-4">
				<ActivityIndicator size="large" color="#58a6ff" />
				<Text className="text-text-secondary text-sm">Loading stations...</Text>
			</View>
		);
	}

	if (!stations || !Array.isArray(stations) || stations.length === 0) {
		return (
			<View className="flex-1 bg-bg-primary p-4">
				<Text className="text-error text-base text-center py-5">No stations available</Text>
			</View>
		);
	}

	return (
		<ScrollView className="flex-1 bg-bg-primary" contentContainerStyle={{ paddingBottom: 32 }}>
			<View className="flex-1 bg-bg-primary px-4 pt-12">
				{/* Top Section: Status + Station Selector (centered) */}
				<View className="items-center py-2">
					<View className="flex-row items-center">
						<View className="absolute left-[-24px]">
							<StatusIndicator lastSeen={lastMeasurementTime} size={10} isFetching={latestFetching} />
						</View>
						<StationSelector
							selectedStationId={selectedStationId}
							onStationChange={handleStationChange}
						/>
					</View>
					{/* Date/Time from latest measurement */}
					<Text className="text-sm text-text-secondary -mt-1">{measurementDateTime}</Text>
				</View>

				{/* Large Pixel Temperature Display (centered) */}
				<View className="items-center my-6">
					<PixelTemperature value={currentTemp} pixelSize={8} color="#e6edf3" />
				</View>

				{/* Temperature Chart */}
				<View className="mb-6">
					{chartLoading ? (
						<View className="py-10 items-center gap-2">
							<ActivityIndicator size="small" color="#58a6ff" />
							<Text className="text-text-secondary text-sm">Loading chart...</Text>
						</View>
					) : (
						<TemperatureChart
							data={(chartData as any)?.data}
							height={180}
							fromTime={fromToday}
							toTime={toNow}
						/>
					)}
				</View>

				{/* Current Conditions Section */}
				<View className="flex-row gap-2 mb-6">
					<WeatherMetric
						label="Wind"
						value={windSpeed}
						unit="km/h"
						icon="wind"
						iconRotation={windDirection}
					/>
					<WeatherMetric
						label="Humidity"
						value={humidity}
						unit="%"
						icon="drop"
					/>
					<WeatherMetric
						label="Pressure"
						value={pressure}
						unit="hpa"
						icon="chart-multiple"
					/>
				</View>

				{/* Past Week Section */}
				<View className="mb-4">
					<TouchableOpacity
						className="flex-row items-center justify-between mb-3"
						onPress={() => router.push('/history')}
						activeOpacity={0.7}
					>
						<Text className="text-text-primary text-lg">Past week</Text>
						<PixelartIcon name="chevron-right" size={20} color="#e6edf3" />
					</TouchableOpacity>
					{weekLoading ? (
						<View className="py-5 items-center gap-2">
							<ActivityIndicator size="small" color="#58a6ff" />
							<Text className="text-text-secondary text-sm">Loading past week...</Text>
						</View>
					) : (
						<PastWeekForecast data={(weekData as any)?.data} />
					)}
				</View>
			</View>
		</ScrollView>
	);
}
