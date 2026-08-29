import { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function OAuthCallback() {
	const { token } = useLocalSearchParams<{ token?: string }>();

	useEffect(() => {
		if (Platform.OS !== 'web') return;

		if (!token) {
			return;
		}

		if (window.opener) {
			window.opener.postMessage({ type: 'oauth-success', token }, window.location.origin);
			window.close();
		} else {
			window.location.href = `/?token=${token}`;
		}
	}, [token]);

	return <View />;
}
