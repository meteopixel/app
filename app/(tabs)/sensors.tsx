import { ThemedText } from "@/components/themed-text";
import { fetchSensors, sensor } from "@/lib/fetch";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";

export default function Sensors() {
	const [sensors, setSensors] = useState<sensor[] | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadUser = async () => {
			try {
				const sensor = await fetchSensors();
				setSensors(sensor);
			} catch (error) {
				console.error('Failed to load user:', error);
			} finally {
				setLoading(false);
			}
		};

		loadUser();
	}, []);

	if (loading) return <ActivityIndicator />;


	return (
		<View>
			<ThemedText>Sensors: </ThemedText>
			<FlatList
				data={sensors}
				keyExtractor={item => item.ID}
				renderItem={({ item }) => (
					<View>
						<ThemedText>ID: {item.ID}</ThemedText>
						<ThemedText>Name: {item.Name}</ThemedText>
						<ThemedText>Location: {item.Location}</ThemedText>
						<ThemedText>Created By: {item.Email}</ThemedText>
					</View>
				)}
			/>
		</View>
	)
}
