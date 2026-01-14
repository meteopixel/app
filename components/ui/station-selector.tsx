import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { PixelartIcon } from '@/components/ui/pixelart-icon';
import { useStations } from '@/lib/queries/useStations';
import { setSelectedStationId } from '@/lib/storage';
import type { Station } from '@/lib/types';

export interface StationSelectorProps {
	selectedStationId?: string;
	onStationChange: (stationId: string) => void;
}

export function StationSelector({ selectedStationId, onStationChange }: StationSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const { data: stations, isLoading } = useStations();

	const selectedStation = stations?.find((s) => s.id === selectedStationId || s.ID === selectedStationId);
	const stationName = selectedStation?.name?.string || selectedStation?.Name || 'Select Station';

	const handleSelectStation = (station: Station) => {
		const stationId = station.id || station.ID;
		if (stationId) {
			setSelectedStationId(stationId);
			onStationChange(stationId);
			setIsOpen(false);
		}
	};

	return (
		<>
			<TouchableOpacity
				className="flex-row items-center justify-center py-2 px-4"
				onPress={() => setIsOpen(true)}
				activeOpacity={0.7}
				hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
			>
				<ThemedText className="text-4xl text-accent-primary text-center">{stationName}</ThemedText>
				<View className="absolute right-[-32px]">
					<PixelartIcon name="chevron-down" size={28} color="#58a6ff" />
				</View>
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
					<View className="bg-bg-secondary rounded-lg p-5 w-4/5 max-h-[70%] border border-border">
						<ThemedText type="subtitle" className="mb-4 text-text-primary">
							Select Station
						</ThemedText>
						<ScrollView className="max-h-[400px]">
							{isLoading ? (
								<ThemedText className="text-text-secondary text-center py-5">
									Loading stations...
								</ThemedText>
							) : stations && stations.length > 0 ? (
								stations.map((station) => {
									const stationId = station.id || station.ID;
									const name = station.name?.string || station.Name || 'Unnamed Station';
									const isSelected = stationId === selectedStationId;

									return (
										<TouchableOpacity
											key={stationId}
											className={`flex-row items-center justify-between p-3 rounded mb-2 ${
												isSelected
													? 'bg-bg-tertiary border border-success'
													: 'bg-bg-tertiary'
											}`}
											onPress={() => handleSelectStation(station)}
											activeOpacity={0.7}
										>
											<ThemedText
												className={`text-base flex-1 ${
													isSelected ? 'text-success font-semibold' : 'text-text-primary'
												}`}
											>
												{name}
											</ThemedText>
											{isSelected && (
												<PixelartIcon name="frame-check" size={16} color="#3fb950" />
											)}
										</TouchableOpacity>
									);
								})
							) : (
								<ThemedText className="text-text-secondary text-center py-5">
									No stations available
								</ThemedText>
							)}
						</ScrollView>
					</View>
				</TouchableOpacity>
			</Modal>
		</>
	);
}
