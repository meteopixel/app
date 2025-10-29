import { useEffect, useState } from "react";
import { fetchUserInfo, userData } from "@/lib/fetch";
import { ActivityIndicator, View } from "react-native";
import { ThemedText } from "@/components/themed-text";


export default function Account() {
	const [user, setUser] = useState<userData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadUser = async () => {
			try {
				const userData = await fetchUserInfo();
				setUser(userData);
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
			<ThemedText>ID: {user?.id}</ThemedText>
			<ThemedText>Email: {user?.email}</ThemedText>
			<ThemedText>Provider: {user?.provider}</ThemedText>
			<ThemedText>Role: {user?.role}</ThemedText>
		</View>
	);
}
