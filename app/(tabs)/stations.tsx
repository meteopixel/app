import { Input } from "@/components/input";
import { Text } from "@/components/text";
import { PixelartIcon } from "@/components/ui/pixelart-icon";
import {
	useCreateStation,
	useDeleteStation,
	useRegenerateToken,
	useUpdateStation,
} from "@/lib/mutations/useStationMutations";
import { useStations } from "@/lib/queries/useStations";
import type { Station } from "@/lib/types";
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	TouchableOpacity,
	View
} from "react-native";

export default function Sensors() {
	const { data: stations, isLoading: loading, error: queryError } = useStations();
	
	// Create form state
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [createName, setCreateName] = useState("");
	const [createLongitude, setCreateLongitude] = useState("");
	const [createLatitude, setCreateLatitude] = useState("");
	
	// Edit form state
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editName, setEditName] = useState("");
	const [editLongitude, setEditLongitude] = useState("");
	const [editLatitude, setEditLatitude] = useState("");
	
	// Token regeneration state
	const [regeneratedTokens, setRegeneratedTokens] = useState<Record<string, string>>({});
	const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
	const [copiedRegeneratedTokens, setCopiedRegeneratedTokens] = useState<Set<string>>(new Set());
	const [copiedStationIds, setCopiedStationIds] = useState<Set<string>>(new Set());
	
	// Newly created station state (for showing API key and ID)
	const [newlyCreatedStation, setNewlyCreatedStation] = useState<{ id: string; api_key: string } | null>(null);
	const [copiedNewStation, setCopiedNewStation] = useState<{ id: boolean; api_key: boolean }>({ id: false, api_key: false });

	// Mutations
	const createStationMutation = useCreateStation();
	const updateStationMutation = useUpdateStation();
	const deleteStationMutation = useDeleteStation();
	const regenerateTokenMutation = useRegenerateToken();

	const handleCreate = async () => {
		if (!createName.trim()) {
			Alert.alert("Error", "Station name is required");
			return;
		}

		const longitude = parseFloat(createLongitude);
		const latitude = parseFloat(createLatitude);

		if (isNaN(longitude) || isNaN(latitude)) {
			Alert.alert("Error", "Valid longitude and latitude are required");
			return;
		}

		createStationMutation.mutate(
			{ name: createName.trim(), location: [longitude, latitude] },
			{
				onSuccess: (result) => {
					// Store the newly created station info to display in copyable format
					if (result.id && result.api_key) {
						setNewlyCreatedStation({
							id: result.id,
							api_key: result.api_key
						});
						setCopiedNewStation({ id: false, api_key: false });
					}
					setCreateName("");
					setCreateLongitude("");
					setCreateLatitude("");
					setShowCreateForm(false);
				},
				onError: (error: any) => {
					console.error('Failed to create station:', error);
					Alert.alert("Error", error.message || "Failed to create station");
				},
			}
		);
	};

	const handleEdit = (station: Station) => {
		if (station.id) {
			setEditingId(station.id);
		}
		setEditName(station.name?.valid ? (station.name.string || "") : "");
		if (station.location?.valid && station.location.p) {
			setEditLongitude(station.location.p.x?.toString() || "");
			setEditLatitude(station.location.p.y?.toString() || "");
		} else {
			setEditLongitude("");
			setEditLatitude("");
		}
	};

	const handleUpdate = async () => {
		if (!editingId) return;

		const longitude = editLongitude ? parseFloat(editLongitude) : undefined;
		const latitude = editLatitude ? parseFloat(editLatitude) : undefined;

		if (editLongitude && (isNaN(longitude!) || latitude === undefined || isNaN(latitude))) {
			Alert.alert("Error", "Valid longitude and latitude are required");
			return;
		}

		const location = (longitude !== undefined && latitude !== undefined) 
			? [longitude, latitude] as [number, number] 
			: undefined;

		updateStationMutation.mutate(
			{
				id: editingId,
				name: editName.trim() || undefined,
				location,
			},
			{
				onSuccess: () => {
					setEditingId(null);
					setEditName("");
					setEditLongitude("");
					setEditLatitude("");
					Alert.alert("Success", "Station updated successfully");
				},
				onError: (error: any) => {
					console.error('Failed to update station:', error);
					Alert.alert("Error", error.message || "Failed to update station");
				},
			}
		);
	};

	const handleDelete = (stationId: string, stationName: string) => {
		Alert.alert(
			"Delete Station",
			`Are you sure you want to delete "${stationName}"? This action cannot be undone.`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: () => {
						deleteStationMutation.mutate(stationId, {
							onSuccess: () => {
								//Alert.alert("Success", "Station deleted successfully");
							},
							onError: (error: any) => {
								console.error('Failed to delete station:', error);
								Alert.alert("Error", error.message || "Failed to delete station");
							},
						});
					}
				}
			]
		);
	};

	const handleRegenerateToken = (stationId: string) => {
		setRegeneratingId(stationId);
		regenerateTokenMutation.mutate(stationId, {
			onSuccess: (result) => {
				if (result.api_key) {
					setRegeneratedTokens(prev => ({
						...prev,
						[stationId]: result.api_key || ""
					}));
				}
				setRegeneratingId(null);

			},
			onError: (error: any) => {
				console.error('Failed to regenerate token:', error);
				setRegeneratingId(null);
				Alert.alert("Error", error.message || "Failed to regenerate token");
			},
		});
	};

	const formatLocation = (location?: Station['location']) => {
		if (!location?.valid || !location.p) return "No location";
		return `${location.p.x?.toFixed(6) || '0'}, ${location.p.y?.toFixed(6) || '0'}`;
	};

	const openLocationInMaps = (location?: Station['location']) => {
		if (!location?.valid || !location.p || !location.p.x || !location.p.y) return;
		
		const latitude = location.p.y;
		const longitude = location.p.x;
		
		// Try native maps first, fallback to Google Maps
		const nativeMapUrl = `geo:${latitude},${longitude}`;
		const googleMapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
		
		Linking.openURL(nativeMapUrl).catch(() => {
			// If native maps fails, try Google Maps
			Linking.openURL(googleMapUrl).catch((err) => {
				console.error('Failed to open maps:', err);
			});
		});
	};

	const formatDate = (timestamp?: Station['createdAt']) => {
		if (!timestamp?.valid || !timestamp.time) return "Unknown";
		try {
			return new Date(timestamp.time).toLocaleString();
		} catch {
			return timestamp.time || "Unknown";
		}
	};

	if (loading && !stations) {
		return (
			<View className="flex-1 bg-bg-primary px-6 items-center justify-center">
				<ActivityIndicator size="large" color="#58a6ff" />
			</View>
		);
	}

	return (
		<View className="flex-1 bg-bg-primary px-6">
			<View className="mt-24 mb-2">
				<Text className="text-6xl text-text-primary mb-2">
					Stations
				</Text>
				{queryError && (
					<Text className="text-error mt-2">
						{queryError instanceof Error ? queryError.message : 'Failed to load stations'}
					</Text>
				)}
			</View>

			{!showCreateForm ? (
				<View className="w-full mb-2">
					<TouchableOpacity
						onPress={() => setShowCreateForm(true)}
						className="w-full bg-accent-primary py-2 rounded-lg items-center justify-center"
						activeOpacity={0.8}
					>
						<Text className="text-text-primary text-base">
							Create New Station
						</Text>
					</TouchableOpacity>
				</View>
			) : (
				<View className="bg-bg-secondary rounded-lg p-3 mb-2 border border-border">
					<Text className="text-text-primary text-lg mb-2">
						Create Station
					</Text>
					<Input
						className="bg-bg-tertiary text-text-primary px-3 py-2 rounded-lg mb-2 border border-border text-sm"
						placeholder="Station Name"
						placeholderTextColor="#8b95a8"
						value={createName}
						onChangeText={setCreateName}
					/>
					<View className="flex-row gap-2 mb-2">
						<Input
							className="flex-1 bg-bg-tertiary text-text-primary px-3 py-2 rounded-lg border border-border text-sm"
							placeholder="Longitude"
							placeholderTextColor="#8b95a8"
							value={createLongitude}
							onChangeText={setCreateLongitude}
							keyboardType="numeric"
						/>
						<Input
							className="flex-1 bg-bg-tertiary text-text-primary px-3 py-2 rounded-lg border border-border text-sm"
							placeholder="Latitude"
							placeholderTextColor="#8b95a8"
							value={createLatitude}
							onChangeText={setCreateLatitude}
							keyboardType="numeric"
						/>
					</View>
					<View className="flex-row gap-2">
						<TouchableOpacity
							onPress={() => {
								setShowCreateForm(false);
								setCreateName("");
								setCreateLongitude("");
								setCreateLatitude("");
							}}
							className="flex-1 border-2 border-border py-2 rounded-lg items-center justify-center"
							activeOpacity={0.8}
						>
							<Text className="text-text-primary text-sm">
								Cancel
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={handleCreate}
							disabled={createStationMutation.isPending}
							className="flex-1 bg-accent-primary py-2 rounded-lg items-center justify-center"
							activeOpacity={0.8}
							style={{ opacity: createStationMutation.isPending ? 0.6 : 1 }}
						>
							<Text className="text-text-primary text-sm">
								{createStationMutation.isPending ? "Creating..." : "Create"}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}

			{newlyCreatedStation && (
				<View className="bg-bg-secondary rounded-lg p-4 mb-2 border border-border">
					<View className="flex-row justify-between items-center mb-2">
						<Text className="text-text-primary text-base">
							Station Created Successfully!
						</Text>
						<TouchableOpacity
							onPress={() => setNewlyCreatedStation(null)}
							className="px-2"
							activeOpacity={0.8}
						>
							<Text className="text-text-secondary text-sm">✕</Text>
						</TouchableOpacity>
					</View>
					<Text className="text-text-secondary text-xs mb-1">
						Station ID (tap to copy):
					</Text>
					<View className="bg-bg-tertiary p-2 rounded mb-2 border border-border">
						<View className="flex-row items-center justify-between">
							<Input
								value={newlyCreatedStation.id}
								editable={false}
								selectTextOnFocus={true}
								className="flex-1 text-text-primary text-xs"
							/>
							<TouchableOpacity
								onPress={async () => {
									await Clipboard.setStringAsync(newlyCreatedStation.id);
									setCopiedNewStation(prev => ({ ...prev, id: true }));
									setTimeout(() => setCopiedNewStation(prev => ({ ...prev, id: false })), 2000);
								}}
								className="ml-2 p-1"
								activeOpacity={0.8}
							>
								{copiedNewStation.id ? (
									<PixelartIcon name="check" size={18} color="#3fb950" />
								) : (
									<PixelartIcon name="clipboard" size={18} color="#58a6ff" />
								)}
							</TouchableOpacity>
						</View>
					</View>
					<Text className="text-text-secondary text-xs mb-1">
						API Key (select text or tap copy):
					</Text>
					<View className="bg-bg-tertiary p-2 rounded mb-2 border border-border">
						<View className="flex-row items-center justify-between">
							<Input
								value={newlyCreatedStation.api_key}
								editable={false}
								selectTextOnFocus={true}
								className="flex-1 text-text-primary text-xs"
							/>
							<TouchableOpacity
								onPress={async () => {
									await Clipboard.setStringAsync(newlyCreatedStation.api_key);
									setCopiedNewStation(prev => ({ ...prev, api_key: true }));
									setTimeout(() => setCopiedNewStation(prev => ({ ...prev, api_key: false })), 2000);
								}}
								className="ml-2 p-1"
								activeOpacity={0.8}
							>
								{copiedNewStation.api_key ? (
									<PixelartIcon name="check" size={18} color="#3fb950" />
								) : (
									<PixelartIcon name="clipboard" size={18} color="#58a6ff" />
								)}
							</TouchableOpacity>
						</View>
					</View>
					<Text className="text-text-tertiary text-xs ">
						⚠️ Save these values - they won't be shown again
					</Text>
				</View>
			)}

			{stations && Array.isArray(stations) && stations.length === 0 ? (
				<View className="flex-1 py-8 items-center justify-center">
					<Text className="text-text-secondary text-lg">
						No stations found. Create your first station above.
					</Text>
				</View>
			) : (
				<ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 16 }}>
					{stations && Array.isArray(stations) && [...stations].reverse().map((item: Station) => {
						const isEditing = editingId === item.id;
						
						if (isEditing) {
							return (
								<View key={item.id} className="bg-bg-secondary rounded-lg p-6 mb-4 border border-border">
									<Text className="text-text-primary text-2xl mb-4">
										Edit Station
									</Text>
									<Input
										className="bg-bg-tertiary text-text-primary px-4 py-3 rounded-lg mb-4 border border-border"
										placeholder="Station Name"
										placeholderTextColor="#8b95a8"
										value={editName}
										onChangeText={setEditName}
									/>
									<Input
										className="bg-bg-tertiary text-text-primary px-4 py-3 rounded-lg mb-4 border border-border"
										placeholder="Longitude"
										placeholderTextColor="#8b95a8"
										value={editLongitude}
										onChangeText={setEditLongitude}
										keyboardType="numeric"
									/>
									<Input
										className="bg-bg-tertiary text-text-primary px-4 py-3 rounded-lg mb-4 border border-border"
										placeholder="Latitude"
										placeholderTextColor="#8b95a8"
										value={editLatitude}
										onChangeText={setEditLatitude}
										keyboardType="numeric"
									/>
									<View className="flex-row gap-3">
										<TouchableOpacity
											onPress={() => {
												setEditingId(null);
												setEditName("");
												setEditLongitude("");
												setEditLatitude("");
											}}
											className="flex-1 border-2 border-border py-3 rounded-lg items-center justify-center"
											activeOpacity={0.8}
										>
											<Text className="text-text-primary">
												Cancel
											</Text>
										</TouchableOpacity>
										<TouchableOpacity
											onPress={handleUpdate}
											disabled={updateStationMutation.isPending}
											className="flex-1 bg-accent-primary py-3 rounded-lg items-center justify-center"
											activeOpacity={0.8}
											style={{ opacity: updateStationMutation.isPending ? 0.6 : 1 }}
										>
											<Text className="text-text-primary">
												{updateStationMutation.isPending ? "Updating..." : "Save"}
											</Text>
										</TouchableOpacity>
									</View>
								</View>
							);
						}

						return (
							<View key={item.id} className="bg-bg-secondary rounded-lg p-6 mb-4 border border-border">
								<View className="flex-row justify-between items-start mb-2">
									<Text className="text-text-primary text-xl flex-1">
										{item.name?.valid ? item.name.string : "Unnamed Station"}
									</Text>
									<TouchableOpacity
										onPress={() => handleEdit(item)}
										className="ml-2 p-1"
										activeOpacity={0.8}
									>
										<PixelartIcon name="edit" size={20} color="#e6edf3" />
									</TouchableOpacity>
								</View>
								{item.id && (() => {
									const stationId = item.id;
									return (
										<TouchableOpacity
											onPress={async () => {
												await Clipboard.setStringAsync(stationId);
												setCopiedStationIds(prev => new Set(prev).add(stationId));
												setTimeout(() => {
													setCopiedStationIds(prev => {
														const newSet = new Set(prev);
														newSet.delete(stationId);
														return newSet;
													});
												}, 2000);
											}}
											className="flex-row items-center justify-between mb-1"
											activeOpacity={0.8}
										>
											<Text className="text-text-secondary text-base flex-1">
												ID: {stationId}
											</Text>
											<View className="w-[14px] h-[14px] items-center justify-center">
												{copiedStationIds.has(stationId) ? (
													<PixelartIcon name="check" size={14} color="#3fb950" />
												) : (
													<PixelartIcon name="clipboard" size={14} color="#8b95a8" />
												)}
											</View>
										</TouchableOpacity>
									);
								})()}
								{item.location?.valid && item.location.p ? (
									<TouchableOpacity
										onPress={() => openLocationInMaps(item.location)}
										className="flex-row items-center justify-between mb-1"
										activeOpacity={0.8}
									>
										<Text className="text-text-secondary text-base flex-1">
											Location: {formatLocation(item.location)}
										</Text>
										<View className="w-[14px] h-[14px] items-center justify-center">
											<PixelartIcon name="map" size={14} color="#8b95a8" />
										</View>
									</TouchableOpacity>
								) : (
									<Text className="text-text-secondary text-base mb-1">
										Location: {formatLocation(item.location)}
									</Text>
								)}
								<Text className="text-text-secondary text-base mb-1">
									Created By: {item.email}
								</Text>
								<Text className="text-text-secondary text-base mb-4">
									Created At: {formatDate(item.createdAt)}
								</Text>
								
								{item.id && regeneratedTokens[item.id] && (() => {
									const apiKey = regeneratedTokens[item.id];
									return (
										<View className="bg-bg-tertiary p-4 rounded-lg mb-4 border border-border">
											<Text className="text-text-primary mb-2">
												New API Key:
											</Text>
											<View className="flex-row items-center justify-between">
												<Input
													value={apiKey}
													editable={false}
													selectTextOnFocus={true}
													className="flex-1 text-text-primary text-xs"
												/>
												<TouchableOpacity
													onPress={async () => {
														await Clipboard.setStringAsync(apiKey);
														setCopiedRegeneratedTokens(prev => new Set(prev).add(item.id!));
														setTimeout(() => {
															setCopiedRegeneratedTokens(prev => {
																const newSet = new Set(prev);
																newSet.delete(item.id!);
																return newSet;
															});
														}, 2000);
													}}
													className="ml-2 p-1"
													activeOpacity={0.8}
												>
													{copiedRegeneratedTokens.has(item.id!) ? (
														<PixelartIcon name="check" size={18} color="#3fb950" />
													) : (
														<PixelartIcon name="clipboard" size={18} color="#e6edf3" />
													)}
												</TouchableOpacity>
											</View>
										</View>
									);
								})()}

								<View className="flex-row gap-2 flex-wrap">
									{item.id && (() => {
										const stationId = item.id;
										return (
											<TouchableOpacity
												onPress={() => handleRegenerateToken(stationId)}
												disabled={regeneratingId === stationId}
												className="flex-1 min-w-[80px] border-2 border-text-primary py-2 rounded-lg items-center justify-center"
												activeOpacity={0.8}
												style={{ opacity: regeneratingId === stationId ? 0.6 : 1 }}
											>
												<Text className="text-text-primary text-xs text-center" numberOfLines={2}>
													{regeneratingId === stationId ? "Regenerating..." : "Regenerate"}
												</Text>
											</TouchableOpacity>
										);
									})()}
									{item.id && (() => {
										const stationId = item.id;
										return (
											<TouchableOpacity
												onPress={() => handleDelete(
													stationId, 
													item.name?.valid ? (item.name.string || "Unnamed") : "Unnamed"
												)}
												className="flex-1 min-w-[80px] border-2 border-error py-2 rounded-lg items-center justify-center"
												activeOpacity={0.8}
											>
												<Text className="text-error text-xs">
													Delete
												</Text>
											</TouchableOpacity>
										);
									})()}
								</View>
							</View>
						);
					})}
				</ScrollView>
			)}
		</View>
	);
}
