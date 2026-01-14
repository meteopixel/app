import type { MeasurementsBucket } from '../types';

export function formatTemperature(value: number | undefined): string {
	if (value === undefined || isNaN(value)) {
		return '--°C';
	}
	return `${Math.round(value)}°C`;
}

export function formatDateTime(timestamp: string | undefined): string {
	if (!timestamp) {
		return '--:--';
	}
	try {
		const date = new Date(timestamp);
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = String(date.getFullYear()).slice(-2);
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		return `${day}.${month}.${year} ${hours}:${minutes}`;
	} catch (error) {
		console.error('Error formatting date:', error);
		return '--:--';
	}
}

export function formatDayAbbreviation(date: Date): string {
	const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
	return days[date.getDay()];
}

export interface ChartDataPoint {
	value: number;
	label?: string;
	frontColor?: string;
}

export function transformMeasurementsForChart(data: MeasurementsBucket[] | undefined): ChartDataPoint[] {
	if (!data || data.length === 0) {
		return [];
	}

	return data.map((bucket) => {
		const value = bucket.temperature?.avg ?? 0;
		const time = bucket.time ? new Date(bucket.time) : new Date();
		const hours = String(time.getHours()).padStart(2, '0');
		const minutes = String(time.getMinutes()).padStart(2, '0');
		const label = `${hours}:${minutes}`;
		
		return {
			value: Math.round(value),
			label,
			frontColor: '#ffffff',
		};
	});
}

export function calculateStatusColor(lastSeen: string | undefined): 'green' | 'orange' | 'red' {
	if (!lastSeen) {
		return 'red';
	}

	try {
		const lastSeenDate = new Date(lastSeen);
		const now = new Date();
		const diffMs = now.getTime() - lastSeenDate.getTime();
		const diffMinutes = diffMs / (1000 * 60);

		if (diffMinutes < 5) {
			return 'green';
		} else if (diffMinutes < 30) {
			return 'orange';
		} else {
			return 'red';
		}
	} catch (error) {
		console.error('Error calculating status color:', error);
		return 'red';
	}
}
