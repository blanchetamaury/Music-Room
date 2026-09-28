import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { ThemedText } from '../components/utils/themed-text';

export default function OAuthCallback() {
	const { code, error } = useLocalSearchParams<{ code?: string; error?: string }>();

	useEffect(() => {
		if (error) {
			if (Platform.OS === 'web' && window.opener) {
				window.opener.postMessage({ type: 'oauth-success', code: null }, window.location.origin);
				window.close();
			}
			return;
		}

		if (!code) return;

		if (Platform.OS === 'web') {
			if (window.opener) {
				window.opener.postMessage({ type: 'oauth-success', code }, window.location.origin);
				window.close();
			}
		}
	}, [code, error]);

	if (error) {
		return (
			<View style={styles.container}>
				<ThemedText>Authentication failed. Please try again.</ThemedText>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<ActivityIndicator />
			<ThemedText style={styles.label}>Signing you in…</ThemedText>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
	},
	label: {
		opacity: 0.7,
	},
});
