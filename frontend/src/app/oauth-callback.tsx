import { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function OAuthCallback() {
	const { token } = useLocalSearchParams<{ token?: string }>();

	useEffect(() => {
		console.log('OAuthCallback mounted, token:', token, 'platform:', Platform.OS);

		if (Platform.OS !== 'web') return;

		if (!token) {
			console.warn('No token found in query params');
			return;
		}

		console.log('window.opener:', window.opener);

		if (window.opener) {
			window.opener.postMessage({ type: 'oauth-success', token }, window.location.origin);
			window.close();
		} else {
			window.location.href = `/?token=${token}`;
		}
	}, [token]);

	return <View />;
}
