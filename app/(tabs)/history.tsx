import { Text } from '@/components/text';
import { BucketSelector } from '@/components/ui/bucket-selector';
import { DateRangeSelector, type DateRange } from '@/components/ui/date-range-selector';
import { MetricChart } from '@/components/ui/metric-chart';
import { SourceToggle, type DataSource } from '@/components/ui/source-toggle';
import { StationSelector } from '@/components/ui/station-selector';
import { useMeasurements } from '@/lib/queries/useMeasurements';
import { useStations } from '@/lib/queries/useStations';
import { getSelectedStationId, setSelectedStationId } from '@/lib/storage';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native';

// Get default date range (last 7 days)
function getDefaultDateRange(): DateRange {
	const now = new Date();
	const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
	return {
		from: start.toISOString(),
		to: now.toISOString(),
		label: 'Last 7 Days',
	};
}

export default function HistoryScreen() {
	const { data: stations, isLoading: stationsLoading } = useStations();
	const [selectedStationId, setSelectedStationIdState] = useState<string | undefined>(undefined);
	
	// History controls state
	const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange);
	const [bucketSize, setBucketSize] = useState('1 hour');
	const [dataSource, setDataSource] = useState<DataSource>('both');

	// Initialize selected station from storage or default to first station
	useEffect(() => {
		if (stations && Array.isArray(stations) && stations.length > 0) {
			const savedStationId = getSelectedStationId();
			if (savedStationId) {
				const stationExists = stations.some(
					(s: typeof stations[0]) => s.id === savedStationId || s.ID === savedStationId
				);
				if (stationExists) {
					setSelectedStationIdState(savedStationId);
				} else {
					const firstStation = stations[0];
					const firstStationId = firstStation?.id || firstStation?.ID;
					if (firstStationId) {
						setSelectedStationIdState(firstStationId);
						setSelectedStationId(firstStationId);
					}
				}
			} else {
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
		setSelectedStationId(stationId);
	};

	// Determine which queries to run based on dataSource
	const shouldFetchStation = dataSource === 'station' || dataSource === 'both';
	const shouldFetchOfficial = dataSource === 'official' || dataSource === 'both';

	// Refreshing state for pull-to-refresh
	const [refreshing, setRefreshing] = useState(false);

	// Fetch station data
	const {
		data: stationData,
		isLoading: stationLoading,
		refetch: refetchStation,
	} = useMeasurements(
		shouldFetchStation ? selectedStationId : undefined,
		dateRange.from,
		dateRange.to,
		bucketSize,
		'station'
	);

	// Fetch official data
	const {
		data: officialData,
		isLoading: officialLoading,
		refetch: refetchOfficial,
	} = useMeasurements(
		shouldFetchOfficial ? selectedStationId : undefined,
		dateRange.from,
		dateRange.to,
		bucketSize,
		'official'
	);

	const isDataLoading = (shouldFetchStation && stationLoading) || (shouldFetchOfficial && officialLoading);

	// Pull-to-refresh handler
	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			const promises: Promise<unknown>[] = [];
			if (shouldFetchStation) {
				promises.push(refetchStation());
			}
			if (shouldFetchOfficial) {
				promises.push(refetchOfficial());
			}
			await Promise.all(promises);
		} finally {
			setRefreshing(false);
		}
	}, [shouldFetchStation, shouldFetchOfficial, refetchStation, refetchOfficial]);

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
		<ScrollView
			className="flex-1 bg-bg-primary"
			contentContainerStyle={{ paddingBottom: 32 }}
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={handleRefresh}
					tintColor="#58a6ff"
					colors={['#58a6ff']}
				/>
			}
		>
			<View className="flex-1 bg-bg-primary px-4 pt-12">
				{/* Header: Station Selector */}
				<View className="items-center py-2">
					<StationSelector
						selectedStationId={selectedStationId}
						onStationChange={handleStationChange}
					/>
				</View>

				{/* Page Title */}
				<View className="mb-4">
					<Text className="text-text-primary text-2xl text-center">Historic Data</Text>
				</View>

				{/* Controls Row */}
				<View className="flex-row flex-wrap gap-2 mb-4 justify-center">
					<DateRangeSelector
						selectedRange={dateRange}
						onRangeChange={setDateRange}
					/>
					<BucketSelector
						selectedBucket={bucketSize}
						onBucketChange={setBucketSize}
					/>
				</View>

				{/* Source Toggle */}
				<View className="items-center mb-6">
					<SourceToggle
						selectedSource={dataSource}
						onSourceChange={setDataSource}
					/>
				</View>

				{/* Charts Section */}
				{isDataLoading ? (
					<View className="py-10 items-center gap-2">
						<ActivityIndicator size="large" color="#58a6ff" />
						<Text className="text-text-secondary text-sm">Loading data...</Text>
					</View>
				) : (
					<View>
						{/* Temperature Chart */}
						<MetricChart
							stationData={shouldFetchStation ? stationData?.data : undefined}
							officialData={shouldFetchOfficial ? officialData?.data : undefined}
							metricKey="temperature"
							label="Temperature"
							unit="°"
							height={180}
							fromTime={dateRange.from}
							toTime={dateRange.to}
						/>

						{/* Humidity Chart */}
						<MetricChart
							stationData={shouldFetchStation ? stationData?.data : undefined}
							officialData={shouldFetchOfficial ? officialData?.data : undefined}
							metricKey="humidity"
							label="Humidity"
							unit="%"
							height={160}
							fromTime={dateRange.from}
							toTime={dateRange.to}
						/>

						{/* Pressure Chart */}
						<MetricChart
							stationData={shouldFetchStation ? stationData?.data : undefined}
							officialData={shouldFetchOfficial ? officialData?.data : undefined}
							metricKey="pressure"
							label="Pressure"
							unit=""
							height={160}
							fromTime={dateRange.from}
							toTime={dateRange.to}
						/>

						{/* Wind Speed Chart */}
						<MetricChart
							stationData={shouldFetchStation ? stationData?.data : undefined}
							officialData={shouldFetchOfficial ? officialData?.data : undefined}
							metricKey="windSpeed"
							label="Wind Speed"
							unit=""
							height={160}
							fromTime={dateRange.from}
							toTime={dateRange.to}
						/>

						{/* Wind Direction Chart */}
						<MetricChart
							stationData={shouldFetchStation ? stationData?.data : undefined}
							officialData={shouldFetchOfficial ? officialData?.data : undefined}
							metricKey="windDirection"
							label="Wind Direction"
							unit="°"
							height={160}
							fromTime={dateRange.from}
							toTime={dateRange.to}
						/>
					</View>
				)}
			</View>
		</ScrollView>
	);
}
