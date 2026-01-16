import { Text } from '@/components/text';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

export type DataSource = 'station' | 'official' | 'both';

export interface SourceToggleProps {
	selectedSource: DataSource;
	onSourceChange: (source: DataSource) => void;
}

interface SourceOption {
	value: DataSource;
	label: string;
}

const sourceOptions: SourceOption[] = [
	{ value: 'station', label: 'Station' },
	{ value: 'official', label: 'Official' },
	{ value: 'both', label: 'Both' },
];

export function SourceToggle({ selectedSource, onSourceChange }: SourceToggleProps) {
	return (
		<View className="flex-row bg-bg-tertiary rounded-lg border border-border overflow-hidden">
			{sourceOptions.map((option, index) => (
				<TouchableOpacity
					key={option.value}
					className={`px-3 py-2 ${
						selectedSource === option.value
							? 'bg-accent-primary'
							: 'bg-transparent'
					} ${index > 0 ? 'border-l border-border' : ''}`}
					onPress={() => onSourceChange(option.value)}
					activeOpacity={0.7}
				>
					<Text
						className={`text-sm ${
							selectedSource === option.value
								? 'text-text-primary'
								: 'text-text-secondary'
						}`}
					>
						{option.label}
					</Text>
				</TouchableOpacity>
			))}
		</View>
	);
}
