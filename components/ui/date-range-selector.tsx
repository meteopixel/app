import { Text } from '@/components/text';
import { ThemedText } from '@/components/themed-text';
import { PixelartIcon } from '@/components/ui/pixelart-icon';
import React, { useState } from 'react';
import { Modal, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';

export interface DateRange {
	from: string; // ISO string
	to: string; // ISO string
	label: string;
}

export interface DateRangeSelectorProps {
	selectedRange: DateRange;
	onRangeChange: (range: DateRange) => void;
}

type PresetKey = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'last90days' | 'custom';

interface Preset {
	key: PresetKey;
	label: string;
	getRange: () => { from: Date; to: Date };
}

const presets: Preset[] = [
	{
		key: 'today',
		label: 'Today',
		getRange: () => {
			const now = new Date();
			const start = new Date(now);
			start.setHours(0, 0, 0, 0);
			return { from: start, to: now };
		},
	},
	{
		key: 'yesterday',
		label: 'Yesterday',
		getRange: () => {
			const now = new Date();
			const start = new Date(now);
			start.setDate(start.getDate() - 1);
			start.setHours(0, 0, 0, 0);
			const end = new Date(start);
			end.setHours(23, 59, 59, 999);
			return { from: start, to: end };
		},
	},
	{
		key: 'last7days',
		label: 'Last 7 Days',
		getRange: () => {
			const now = new Date();
			const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			return { from: start, to: now };
		},
	},
	{
		key: 'last30days',
		label: 'Last 30 Days',
		getRange: () => {
			const now = new Date();
			const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
			return { from: start, to: now };
		},
	},
	{
		key: 'last90days',
		label: 'Last 90 Days',
		getRange: () => {
			const now = new Date();
			const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
			return { from: start, to: now };
		},
	},
];

function formatDateForInput(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function formatTimeForInput(date: Date): string {
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${hours}:${minutes}`;
}

function parseDateTimeInputs(dateStr: string, timeStr: string): Date | null {
	const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	const timeMatch = timeStr.match(/^(\d{2}):(\d{2})$/);
	
	if (!dateMatch) return null;
	
	const year = parseInt(dateMatch[1], 10);
	const month = parseInt(dateMatch[2], 10) - 1;
	const day = parseInt(dateMatch[3], 10);
	
	let hours = 0;
	let minutes = 0;
	
	if (timeMatch) {
		hours = parseInt(timeMatch[1], 10);
		minutes = parseInt(timeMatch[2], 10);
	}
	
	const date = new Date(year, month, day, hours, minutes, 0, 0);
	if (isNaN(date.getTime())) return null;
	
	return date;
}

export function DateRangeSelector({ selectedRange, onRangeChange }: DateRangeSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [activePreset, setActivePreset] = useState<PresetKey>('last7days');
	const [showCustom, setShowCustom] = useState(false);
	
	// Custom date inputs
	const [customFromDate, setCustomFromDate] = useState('');
	const [customFromTime, setCustomFromTime] = useState('00:00');
	const [customToDate, setCustomToDate] = useState('');
	const [customToTime, setCustomToTime] = useState('23:59');

	const handlePresetSelect = (preset: Preset) => {
		const { from, to } = preset.getRange();
		setActivePreset(preset.key);
		setShowCustom(false);
		onRangeChange({
			from: from.toISOString(),
			to: to.toISOString(),
			label: preset.label,
		});
		setIsOpen(false);
	};

	const handleCustomToggle = () => {
		setShowCustom(true);
		setActivePreset('custom');
		// Initialize custom inputs with current range
		const fromDate = new Date(selectedRange.from);
		const toDate = new Date(selectedRange.to);
		setCustomFromDate(formatDateForInput(fromDate));
		setCustomFromTime(formatTimeForInput(fromDate));
		setCustomToDate(formatDateForInput(toDate));
		setCustomToTime(formatTimeForInput(toDate));
	};

	const handleCustomApply = () => {
		const fromDate = parseDateTimeInputs(customFromDate, customFromTime);
		const toDate = parseDateTimeInputs(customToDate, customToTime);
		
		if (!fromDate || !toDate) {
			return;
		}
		
		if (fromDate >= toDate) {
			return;
		}
		
		const fromStr = formatDateForInput(fromDate);
		const toStr = formatDateForInput(toDate);
		
		onRangeChange({
			from: fromDate.toISOString(),
			to: toDate.toISOString(),
			label: `${fromStr} - ${toStr}`,
		});
		setIsOpen(false);
	};

	return (
		<>
			<TouchableOpacity
				className="flex-row items-center bg-bg-tertiary px-3 py-2 rounded-lg border border-border"
				onPress={() => setIsOpen(true)}
				activeOpacity={0.7}
			>
				<PixelartIcon name="calendar" size={16} color="#8b95a8" />
				<Text className="text-text-primary text-sm ml-2 mr-1">{selectedRange.label}</Text>
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
						<View className="bg-bg-secondary rounded-lg p-5 w-80 max-h-[80%] border border-border">
							<ThemedText type="subtitle" className="mb-4 text-text-primary">
								Select Date Range
							</ThemedText>
							
							<ScrollView className="max-h-[400px]">
								{/* Presets */}
								{presets.map((preset) => (
									<TouchableOpacity
										key={preset.key}
										className={`flex-row items-center justify-between p-3 rounded mb-2 ${
											activePreset === preset.key && !showCustom
												? 'bg-bg-tertiary border border-accent-primary'
												: 'bg-bg-tertiary'
										}`}
										onPress={() => handlePresetSelect(preset)}
										activeOpacity={0.7}
									>
										<Text
											className={`text-base ${
												activePreset === preset.key && !showCustom
													? 'text-accent-primary'
													: 'text-text-primary'
											}`}
										>
											{preset.label}
										</Text>
										{activePreset === preset.key && !showCustom && (
											<PixelartIcon name="frame-check" size={16} color="#58a6ff" />
										)}
									</TouchableOpacity>
								))}

								{/* Custom option */}
								<TouchableOpacity
									className={`flex-row items-center justify-between p-3 rounded mb-2 ${
										showCustom
											? 'bg-bg-tertiary border border-accent-primary'
											: 'bg-bg-tertiary'
									}`}
									onPress={handleCustomToggle}
									activeOpacity={0.7}
								>
									<Text
										className={`text-base ${
											showCustom ? 'text-accent-primary' : 'text-text-primary'
										}`}
									>
										Custom Range
									</Text>
									{showCustom && (
										<PixelartIcon name="frame-check" size={16} color="#58a6ff" />
									)}
								</TouchableOpacity>

								{/* Custom inputs */}
								{showCustom && (
									<View className="bg-bg-primary rounded-lg p-3 mt-2">
										<Text className="text-text-secondary text-xs mb-2">From</Text>
										<View className="flex-row gap-2 mb-3">
											<TextInput
												className="flex-1 bg-bg-tertiary text-text-primary px-3 py-2 rounded border border-border text-sm"
												placeholder="YYYY-MM-DD"
												placeholderTextColor="#8b95a8"
												value={customFromDate}
												onChangeText={setCustomFromDate}
											/>
											<TextInput
												className="w-20 bg-bg-tertiary text-text-primary px-3 py-2 rounded border border-border text-sm"
												placeholder="HH:MM"
												placeholderTextColor="#8b95a8"
												value={customFromTime}
												onChangeText={setCustomFromTime}
											/>
										</View>
										
										<Text className="text-text-secondary text-xs mb-2">To</Text>
										<View className="flex-row gap-2 mb-3">
											<TextInput
												className="flex-1 bg-bg-tertiary text-text-primary px-3 py-2 rounded border border-border text-sm"
												placeholder="YYYY-MM-DD"
												placeholderTextColor="#8b95a8"
												value={customToDate}
												onChangeText={setCustomToDate}
											/>
											<TextInput
												className="w-20 bg-bg-tertiary text-text-primary px-3 py-2 rounded border border-border text-sm"
												placeholder="HH:MM"
												placeholderTextColor="#8b95a8"
												value={customToTime}
												onChangeText={setCustomToTime}
											/>
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
