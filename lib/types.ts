/**
 * Central types file for the application
 * These interfaces define the data structures used throughout the app.
 * 
 * Note: These can be populated from generated types at build time,
 * but this file serves as the single source of truth for type definitions.
 */

// PostgreSQL pgtype types
export interface PgtypeVec2 {
	x?: number;
	y?: number;
}

export interface PgtypePoint {
	p?: PgtypeVec2;
	valid?: boolean;
}

export interface PgtypeText {
	string?: string;
	valid?: boolean;
}

export interface PgtypeTimestamp {
	infinityModifier?: 1 | 0 | -1;
	time?: string;
	valid?: boolean;
}

// User types
export interface AuthUserInfo {
	email?: string;
	id?: string;
	provider?: string;
	role?: string;
}

// Station types
// Backend returns PascalCase fields, so we support both formats
export interface Station {
	// Backend format (PascalCase)
	ID?: string;
	Name?: string;
	CreatedBy?: string;
	Location?: string; // Format: "(x,y)" as string
	CreatedAt?: string; // ISO timestamp string
	Email?: string;
	
	// Frontend format (camelCase) - for transformed data
	id?: string;
	name?: PgtypeText;
	createdBy?: string;
	location?: PgtypePoint;
	createdAt?: PgtypeTimestamp;
	email?: string;
}

export interface CreateStationInput {
	name?: string;
	location?: [number, number];
}

export interface CreateStationOutput {
	id?: string;
	name?: string;
	api_key?: string;
}

export interface UpdateStationInput {
	name?: string;
	location?: [number, number];
}

export interface UpdateStationOutput {
	id?: string;
	name?: string;
	location?: [number, number];
}

export interface RegenerateTokenOutput {
	id?: string;
	name?: string;
	api_key?: string;
}

// Measurement types
export interface MeasurementData {
	station?: number;
	official?: number;
	delta?: number;
}

export interface WindData {
	direction?: MeasurementData;
	speed?: MeasurementData;
}

export interface DataBucket {
	avg?: number;
	min?: number;
	max?: number;
}

export interface MeasurementsBucket {
	time?: string;
	temperature?: DataBucket;
	humidity?: DataBucket;
	pressure?: DataBucket;
	windSpeed?: DataBucket;
	windDirection?: DataBucket;
}

export interface MeasurementsResponse {
	data?: MeasurementsBucket[];
	from?: string;
	to?: string;
	interval?: string;
	source?: string;
	stationID?: string;
}

export interface LatestMeasurementsResponse {
	humidity?: MeasurementData;
	pressure?: MeasurementData;
	temprature?: MeasurementData; // Note: API has typo "temprature"
	wind?: WindData;
}

// Legacy type aliases for backward compatibility
export type userData = AuthUserInfo;
export type station = Station;

