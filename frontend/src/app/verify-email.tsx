import { useConfirmEmailMutation } from '@/src/lib/fetcher/tanstack/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedText } from '../components/utils/themed-text';

export default function VerifyEmailRoute() {
	const { token } = useLocalSearchParams<{ token?: string }>();
	const router = useRouter();
	const confirmMutation = useConfirmEmailMutation();
	const consumed = useRef(false);

	useEffect(() => {
		if (consumed.current || !token) return;
		consumed.current = true;
		confirmMutation.mutate(token);
	}, [token]);

	const failed = !token || confirmMutation.isError;
	const success = confirmMutation.isSuccess;

	return (
		<View style={styles.container}>
			{confirmMutation.isPending ? (
				<>
					<ActivityIndicator />
					<ThemedText style={styles.label}>Verifying your email…</ThemedText>
				</>
			) : success ? (
				<>
					<ThemedText type="title" style={styles.title}>
						Email verified
					</ThemedText>
					<ThemedText style={styles.label}>You can now sign in to Music Room.</ThemedText>
				</>
			) : (
				<>
					<ThemedText type="title" style={styles.title}>
						Verification failed
					</ThemedText>
					<ThemedText style={styles.label}>
						{!token
							? 'This verification link is invalid or incomplete.'
							: (confirmMutation.error?.message ?? 'This verification link is invalid or has expired.')}
					</ThemedText>
				</>
			)}

			{failed || success ? (
				<ThemedText type="link" style={styles.link} onPress={() => router.replace('/login')}>
					Go to login
				</ThemedText>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
		padding: 24,
	},
	title: {
		textAlign: 'center',
	},
	label: {
		opacity: 0.7,
		textAlign: 'center',
	},
	link: {
		marginTop: 8,
	},
});
