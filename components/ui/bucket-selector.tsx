import { Text } from '@/components/text';
import { ThemedText } from '@/components/themed-text';
import { PixelartIcon } from '@/components/ui/pixelart-icon';
import React, { useState } from 'react';
import { Modal, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';

export interface BucketSelectorProps {
	selectedBucket: string;
	onBucketChange: (bucket: string) => void;
}

interface BucketPreset {
	value: string;
	label: string;
}

const bucketPresets: BucketPreset[] = [
	{ value: '1 second', label: '1 Second' },
	{ value: '10 seconds', label: '10 Seconds' },
	{ value: '1 minute', label: '1 Minute' },
	{ value: '5 minutes', label: '5 Minutes' },
	{ value: '15 minutes', label: '15 Minutes' },
	{ value: '30 minutes', label: '30 Minutes' },
	{ value: '1 hour', label: '1 Hour' },
	{ value: '6 hours', label: '6 Hours' },
	{ value: '12 hours', label: '12 Hours' },
	{ value: '1 day', label: '1 Day' },
	{ value: '7 days', label: '7 Days' },
	{ value: '30 days', label: '30 Days' },
];

function formatBucketLabel(bucket: string): string {
	const preset = bucketPresets.find(p => p.value === bucket);
	if (preset) return preset.label;
	
	// Format custom bucket
	const match = bucket.match(/^(\d+)\s*(\w+)$/);
	if (match) {
		const num = match[1];
		const unit = match[2].charAt(0).toUpperCase() + match[2].slice(1);
		return `${num} ${unit}`;
	}
	return bucket;
}

export function BucketSelector({ selectedBucket, onBucketChange }: BucketSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [showCustom, setShowCustom] = useState(false);
	const [customValue, setCustomValue] = useState('');
	const [customUnit, setCustomUnit] = useState<'seconds' | 'minutes' | 'hours' | 'days'>('hours');

	const isPreset = bucketPresets.some(p => p.value === selectedBucket);

	const handlePresetSelect = (preset: BucketPreset) => {
		onBucketChange(preset.value);
		setShowCustom(false);
		setIsOpen(false);
	};

	const handleCustomToggle = () => {
		setShowCustom(true);
		// Parse current bucket if custom
		if (!isPreset) {
			const match = selectedBucket.match(/^(\d+)\s*(\w+)$/);
			if (match) {
				setCustomValue(match[1]);
				const unit = match[2].toLowerCase();
				if (unit.startsWith('second')) setCustomUnit('seconds');
				else if (unit.startsWith('minute')) setCustomUnit('minutes');
				else if (unit.startsWith('hour')) setCustomUnit('hours');
				else if (unit.startsWith('day')) setCustomUnit('days');
			}
		} else {
			setCustomValue('');
		}
	};

	const handleCustomApply = () => {
		const num = parseInt(customValue, 10);
		if (isNaN(num) || num <= 0) return;
		
		const bucket = `${num} ${customUnit}`;
		onBucketChange(bucket);
		setIsOpen(false);
	};

	const units: Array<{ value: 'seconds' | 'minutes' | 'hours' | 'days'; label: string }> = [
		{ value: 'seconds', label: 'Seconds' },
		{ value: 'minutes', label: 'Minutes' },
		{ value: 'hours', label: 'Hours' },
		{ value: 'days', label: 'Days' },
	];

	return (
		<>
			<TouchableOpacity
				className="flex-row items-center bg-bg-tertiary px-3 py-2 rounded-lg border border-border"
				onPress={() => setIsOpen(true)}
				activeOpacity={0.7}
			>
				<PixelartIcon name="sliders" size={16} color="#8b95a8" />
				<Text className="text-text-primary text-sm ml-2 mr-1">{formatBucketLabel(selectedBucket)}</Text>
				<PixelartIcon name="chevron-down" size={14} color="#8b95a8" />
			</TouchableOpacity>

			<Modal
				visible={isOpen}
				transparent
				animationType="fade"
				onRequestClose={() => setIsOpen(false)}
			>
				<TouchableOpacity
					className="flex-1 bg-black/70 justify-center items-center"
					activeOpacity={1}
					onPress={() => setIsOpen(false)}
				>
					<TouchableOpacity 
						activeOpacity={1}
						onPress={(e) => e.stopPropagation()}
					>
						<View className="bg-bg-secondary rounded-lg p-5 w-72 max-h-[80%] border border-border">
							<ThemedText type="subtitle" className="mb-4 text-text-primary">
								Bucket Size
							</ThemedText>
							
							<ScrollView className="max-h-[350px]">
								{bucketPresets.map((preset) => (
									<TouchableOpacity
										key={preset.value}
										className={`flex-row items-center justify-between p-3 rounded mb-2 ${
											selectedBucket === preset.value && !showCustom
												? 'bg-bg-tertiary border border-accent-primary'
												: 'bg-bg-tertiary'
										}`}
										onPress={() => handlePresetSelect(preset)}
										activeOpacity={0.7}
									>
										<Text
											className={`text-base ${
												selectedBucket === preset.value && !showCustom
													? 'text-accent-primary'
													: 'text-text-primary'
											}`}
										>
											{preset.label}
										</Text>
										{selectedBucket === preset.value && !showCustom && (
											<PixelartIcon name="frame-check" size={16} color="#58a6ff" />
										)}
									</TouchableOpacity>
								))}

								{/* Custom option */}
								<TouchableOpacity
									className={`flex-row items-center justify-between p-3 rounded mb-2 ${
										showCustom || (!isPreset && !showCustom)
											? 'bg-bg-tertiary border border-accent-primary'
											: 'bg-bg-tertiary'
									}`}
									onPress={handleCustomToggle}
									activeOpacity={0.7}
								>
									<Text
										className={`text-base ${
											showCustom || (!isPreset && !showCustom)
												? 'text-accent-primary'
												: 'text-text-primary'
										}`}
									>
										Custom
									</Text>
									{(showCustom || (!isPreset && !showCustom)) && (
										<PixelartIcon name="frame-check" size={16} color="#58a6ff" />
									)}
								</TouchableOpacity>

								{/* Custom inputs */}
								{showCustom && (
									<View className="bg-bg-primary rounded-lg p-3 mt-2">
										<View className="flex-row gap-2 mb-3">
											<TextInput
												className="w-20 bg-bg-tertiary text-text-primary px-3 py-2 rounded border border-border text-sm text-center"
												placeholder="10"
												placeholderTextColor="#8b95a8"
												value={customValue}
												onChangeText={setCustomValue}
												keyboardType="numeric"
											/>
											<View className="flex-1 flex-row flex-wrap gap-1">
												{units.map((unit) => (
													<TouchableOpacity
														key={unit.value}
														className={`px-2 py-2 rounded ${
															customUnit === unit.value
																? 'bg-accent-primary'
																: 'bg-bg-tertiary'
														}`}
														onPress={() => setCustomUnit(unit.value)}
														activeOpacity={0.7}
													>
														<Text
															className={`text-xs ${
																customUnit === unit.value
																	? 'text-text-primary'
																	: 'text-text-secondary'
															}`}
														>
															{unit.label}
														</Text>
													</TouchableOpacity>
												))}
											</View>
										</View>

										<TouchableOpacity
											className="bg-accent-primary py-2 rounded items-center"
											onPress={handleCustomApply}
											activeOpacity={0.8}
										>
											<Text className="text-text-primary text-sm">Apply</Text>
										</TouchableOpacity>
									</View>
								)}
							</ScrollView>
						</View>
					</TouchableOpacity>
				</TouchableOpacity>
			</Modal>
		</>
	);
}
