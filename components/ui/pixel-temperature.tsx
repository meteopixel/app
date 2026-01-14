import React from 'react';
import { View } from 'react-native';

// Pixel art digit patterns (5x7 grid for each digit)
// 1 = filled pixel, 0 = empty
const DIGIT_PATTERNS: Record<string, number[][]> = {
	'0': [
		[1, 1, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 1, 1, 1, 1],
	],
	'1': [
		[0, 0, 1, 0, 0],
		[0, 1, 1, 0, 0],
		[0, 0, 1, 0, 0],
		[0, 0, 1, 0, 0],
		[0, 0, 1, 0, 0],
		[0, 0, 1, 0, 0],
		[0, 1, 1, 1, 0],
	],
	'2': [
		[1, 1, 1, 1, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0],
		[1, 0, 0, 0, 0],
		[1, 1, 1, 1, 1],
	],
	'3': [
		[1, 1, 1, 1, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[1, 1, 1, 1, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[1, 1, 1, 1, 1],
	],
	'4': [
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 1, 1, 1, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
	],
	'5': [
		[1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0],
		[1, 0, 0, 0, 0],
		[1, 1, 1, 1, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[1, 1, 1, 1, 1],
	],
	'6': [
		[1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0],
		[1, 0, 0, 0, 0],
		[1, 1, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 1, 1, 1, 1],
	],
	'7': [
		[1, 1, 1, 1, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 1, 0],
		[0, 0, 1, 0, 0],
		[0, 0, 1, 0, 0],
		[0, 0, 1, 0, 0],
	],
	'8': [
		[1, 1, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 1, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 1, 1, 1, 1],
	],
	'9': [
		[1, 1, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 1, 1, 1, 1],
		[0, 0, 0, 0, 1],
		[0, 0, 0, 0, 1],
		[1, 1, 1, 1, 1],
	],
	'-': [
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[1, 1, 1, 1, 1],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
	],
	'°': [
		[0, 1, 1, 0, 0],
		[1, 0, 0, 1, 0],
		[0, 1, 1, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
	],
	'C': [
		[1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0],
		[1, 0, 0, 0, 0],
		[1, 0, 0, 0, 0],
		[1, 0, 0, 0, 0],
		[1, 0, 0, 0, 0],
		[1, 1, 1, 1, 1],
	],
};

interface PixelDigitProps {
	char: string;
	pixelSize: number;
	color: string;
}

function PixelDigit({ char, pixelSize, color }: PixelDigitProps) {
	const pattern = DIGIT_PATTERNS[char];
	if (!pattern) return null;

	return (
		<View style={{ gap: 1 }}>
			{pattern.map((row, rowIndex) => (
				<View key={rowIndex} style={{ flexDirection: 'row', gap: 1 }}>
					{row.map((pixel, colIndex) => (
						<View
							key={colIndex}
							style={{
								width: pixelSize,
								height: pixelSize,
								backgroundColor: pixel ? color : 'transparent',
							}}
						/>
					))}
				</View>
			))}
		</View>
	);
}

export interface PixelTemperatureProps {
	value: number | undefined;
	pixelSize?: number;
	color?: string;
}

export function PixelTemperature({
	value,
	pixelSize = 8,
	color = '#e6edf3',
}: PixelTemperatureProps) {
	const tempString = value !== undefined && !isNaN(value)
		? `${Math.round(value)}°C`
		: '--°C';

	const chars = tempString.split('');

	return (
		<View className="flex-row items-end justify-center" style={{ gap: pixelSize * 2 }}>
			{chars.map((char, index) => (
				<PixelDigit key={index} char={char} pixelSize={pixelSize} color={color} />
			))}
		</View>
	);
}
