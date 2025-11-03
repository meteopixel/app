import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { 
	fetchStations, 
	createStation, 
	updateStation, 
	deleteStation, 
	regenerateStationToken,
	station,
	RegenerateTokenOutput 
} from "@/lib/fetch";
import { useEffect, useState } from "react";
import { 
	ActivityIndicator, 
	FlatList, 
	View, 
	StyleSheet, 
	Button, 
	TextInput, 
	Alert,
	ScrollView
} from "react-native";

export default function Sensors() {
	const [stations, setStations] = useState<station[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	
	// Create form state
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [createName, setCreateName] = useState("");
	const [createLongitude, setCreateLongitude] = useState("");
	const [createLatitude, setCreateLatitude] = useState("");
	const [creating, setCreating] = useState(false);
	
	// Edit form state
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editName, setEditName] = useState("");
	const [editLongitude, setEditLongitude] = useState("");
	const [editLatitude, setEditLatitude] = useState("");
	const [updating, setUpdating] = useState(false);
	
	// Token regeneration state
	const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
	const [regeneratedTokens, setRegeneratedTokens] = useState<Record<string, string>>({});

	const loadStations = async () => {
		setLoading(true);
		setError(null);
		try {
			const stationsData = await fetchStations();
			setStations(stationsData);
		} catch (error) {
			console.error('Failed to load stations:', error);
			setError('Failed to load stations');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadStations();
	}, []);

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

		setCreating(true);
		setError(null);
		try {
			const result = await createStation(createName.trim(), [longitude, latitude]);
			Alert.alert(
				"Success", 
				`Station created!\nAPI Key: ${result.api_key}\n\nPlease save this key - it won't be shown again.`,
				[{ text: "OK", onPress: () => {
					setCreateName("");
					setCreateLongitude("");
					setCreateLatitude("");
					setShowCreateForm(false);
					loadStations();
				}}]
			);
		} catch (error: any) {
			console.error('Failed to create station:', error);
			Alert.alert("Error", error.message || "Failed to create station");
		} finally {
			setCreating(false);
		}
	};

	const handleEdit = (station: station) => {
		setEditingId(station.id);
		setEditName(station.name.valid ? station.name.string : "");
		if (station.location.valid) {
			setEditLongitude(station.location.p.x.toString());
			setEditLatitude(station.location.p.y.toString());
		} else {
			setEditLongitude("");
			setEditLatitude("");
		}
	};

	const handleUpdate = async () => {
		if (!editingId) return;

		setUpdating(true);
		setError(null);
		try {
			const longitude = editLongitude ? parseFloat(editLongitude) : undefined;
			const latitude = editLatitude ? parseFloat(editLatitude) : undefined;

			if (editLongitude && (isNaN(longitude!) || latitude === undefined || isNaN(latitude))) {
				Alert.alert("Error", "Valid longitude and latitude are required");
				setUpdating(false);
				return;
			}

			const location = (longitude !== undefined && latitude !== undefined) 
				? [longitude, latitude] as [number, number] 
				: undefined;

			await updateStation(
				editingId, 
				editName.trim() || undefined, 
				location
			);
			setEditingId(null);
			setEditName("");
			setEditLongitude("");
			setEditLatitude("");
			loadStations();
			Alert.alert("Success", "Station updated successfully");
		} catch (error: any) {
			console.error('Failed to update station:', error);
			Alert.alert("Error", error.message || "Failed to update station");
		} finally {
			setUpdating(false);
		}
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
					onPress: async () => {
						setError(null);
						try {
							await deleteStation(stationId);
							loadStations();
							Alert.alert("Success", "Station deleted successfully");
						} catch (error: any) {
							console.error('Failed to delete station:', error);
							Alert.alert("Error", error.message || "Failed to delete station");
						}
					}
				}
			]
		);
	};

	const handleRegenerateToken = async (stationId: string) => {
		setRegeneratingId(stationId);
		setError(null);
		try {
			const result = await regenerateStationToken(stationId);
			setRegeneratedTokens(prev => ({
				...prev,
				[stationId]: result.api_key
			}));
			Alert.alert(
				"Token Regenerated",
				`New API Key: ${result.api_key}\n\nPlease save this key - it won't be shown again.`
			);
		} catch (error: any) {
			console.error('Failed to regenerate token:', error);
			Alert.alert("Error", error.message || "Failed to regenerate token");
		} finally {
			setRegeneratingId(null);
		}
	};

	const formatLocation = (location: station['location']) => {
		if (!location.valid) return "No location";
		return `${location.p.x.toFixed(6)}, ${location.p.y.toFixed(6)}`;
	};

	const formatDate = (timestamp: station['createdAt']) => {
		if (!timestamp.valid || !timestamp.time) return "Unknown";
		try {
			return new Date(timestamp.time).toLocaleString();
		} catch {
			return timestamp.time;
		}
	};

	if (loading) {
		return (
			<ThemedView style={styles.container}>
				<ActivityIndicator size="large" />
			</ThemedView>
		);
	}

	return (
		<ScrollView style={styles.container}>
			<ThemedView style={styles.header}>
				<ThemedText type="title">Stations</ThemedText>
				{error && (
					<ThemedText style={styles.error}>{error}</ThemedText>
				)}
			</ThemedView>

			{!showCreateForm ? (
				<View style={styles.buttonContainer}>
					<Button
						title="Create New Station"
						onPress={() => setShowCreateForm(true)}
					/>
				</View>
			) : (
				<ThemedView style={styles.formContainer}>
					<ThemedText type="subtitle">Create Station</ThemedText>
					<TextInput
						style={styles.input}
						placeholder="Station Name"
						value={createName}
						onChangeText={setCreateName}
					/>
					<TextInput
						style={styles.input}
						placeholder="Longitude"
						value={createLongitude}
						onChangeText={setCreateLongitude}
						keyboardType="numeric"
					/>
					<TextInput
						style={styles.input}
						placeholder="Latitude"
						value={createLatitude}
						onChangeText={setCreateLatitude}
						keyboardType="numeric"
					/>
					<View style={styles.formButtons}>
						<Button
							title="Cancel"
							onPress={() => {
								setShowCreateForm(false);
								setCreateName("");
								setCreateLongitude("");
								setCreateLatitude("");
							}}
						/>
						<Button
							title={creating ? "Creating..." : "Create"}
							onPress={handleCreate}
							disabled={creating}
						/>
					</View>
				</ThemedView>
			)}

			{stations && stations.length === 0 ? (
				<ThemedView style={styles.emptyContainer}>
					<ThemedText>No stations found. Create your first station above.</ThemedText>
				</ThemedView>
			) : (
				<FlatList
					data={stations}
					keyExtractor={item => item.id}
					scrollEnabled={false}
					renderItem={({ item }) => {
						const isEditing = editingId === item.id;
						
						if (isEditing) {
							return (
								<ThemedView style={styles.stationCard}>
									<ThemedText type="subtitle">Edit Station</ThemedText>
									<TextInput
										style={styles.input}
										placeholder="Station Name"
										value={editName}
										onChangeText={setEditName}
									/>
									<TextInput
										style={styles.input}
										placeholder="Longitude"
										value={editLongitude}
										onChangeText={setEditLongitude}
										keyboardType="numeric"
									/>
									<TextInput
										style={styles.input}
										placeholder="Latitude"
										value={editLatitude}
										onChangeText={setEditLatitude}
										keyboardType="numeric"
									/>
									<View style={styles.formButtons}>
										<Button
											title="Cancel"
											onPress={() => {
												setEditingId(null);
												setEditName("");
												setEditLongitude("");
												setEditLatitude("");
											}}
										/>
										<Button
											title={updating ? "Updating..." : "Save"}
											onPress={handleUpdate}
											disabled={updating}
										/>
									</View>
								</ThemedView>
							);
						}

						return (
							<ThemedView style={styles.stationCard}>
								<ThemedText type="defaultSemiBold">
									{item.name.valid ? item.name.string : "Unnamed Station"}
								</ThemedText>
								<ThemedText>ID: {item.id}</ThemedText>
								<ThemedText>Location: {formatLocation(item.location)}</ThemedText>
								<ThemedText>Created By: {item.email}</ThemedText>
								<ThemedText>Created At: {formatDate(item.createdAt)}</ThemedText>
								
								{regeneratedTokens[item.id] && (
									<ThemedView style={styles.tokenDisplay}>
										<ThemedText style={styles.tokenLabel}>New API Key:</ThemedText>
										<ThemedText style={styles.tokenValue}>{regeneratedTokens[item.id]}</ThemedText>
									</ThemedView>
								)}

								<View style={styles.actionButtons}>
									<Button
										title="Edit"
										onPress={() => handleEdit(item)}
									/>
									<Button
										title={
											regeneratingId === item.id 
												? "Regenerating..." 
												: "Regenerate Token"
										}
										onPress={() => handleRegenerateToken(item.id)}
										disabled={regeneratingId === item.id}
									/>
									<Button
										title="Delete"
										color="red"
										onPress={() => handleDelete(
											item.id, 
											item.name.valid ? item.name.string : "Unnamed"
										)}
									/>
								</View>
							</ThemedView>
						);
					}}
				/>
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	header: {
		marginBottom: 16,
	},
	error: {
		color: 'red',
		marginTop: 8,
	},
	buttonContainer: {
		marginBottom: 16,
	},
	formContainer: {
		padding: 16,
		marginBottom: 16,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#ccc',
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 4,
		padding: 12,
		marginBottom: 12,
		backgroundColor: 'white',
		color: 'black',
	},
	formButtons: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginTop: 8,
	},
	emptyContainer: {
		padding: 32,
		alignItems: 'center',
	},
	stationCard: {
		padding: 16,
		marginBottom: 16,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#ccc',
	},
	actionButtons: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginTop: 12,
	},
	tokenDisplay: {
		backgroundColor: '#f0f0f0',
		padding: 12,
		borderRadius: 4,
		marginTop: 8,
		marginBottom: 8,
	},
	tokenLabel: {
		fontWeight: 'bold',
		marginBottom: 4,
	},
	tokenValue: {
		fontFamily: 'monospace',
		fontSize: 12,
	},
});