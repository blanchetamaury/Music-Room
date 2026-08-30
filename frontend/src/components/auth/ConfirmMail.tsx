import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { api } from '../../lib/api/client';
import { ThemedText } from '../themed-text';

export function ConfirmMail({
	onBack,
	onConfirmComplete,
	email,
}: {
	onBack?: (value: boolean) => void;
	onConfirmComplete?: (value: boolean) => void;
	email: string;
}) {
	const [codeSent, setCodeSent] = useState(false);
	const [code, setCode] = useState('');
	const [countdown, setCountdown] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const timerRef = useRef<number | null>(null);

	const reveal = useSharedValue(0);

	useEffect(() => {
		if (codeSent) {
			reveal.value = withTiming(1, { duration: 350 });
			setCountdown(60);
			timerRef.current = setInterval(() => {
				setCountdown((c) => {
					if (c <= 1) {
						if (timerRef.current) clearInterval(timerRef.current as any);
						return 0;
					}
					return c - 1;
				});
			}, 1000) as unknown as number;
		} else {
			reveal.value = withTiming(0, { duration: 300 });
			if (timerRef.current) {
				clearInterval(timerRef.current as any);
				timerRef.current = null;
			}
			setCountdown(0);
			setCode('');
		}
		return () => {
			if (timerRef.current) clearInterval(timerRef.current as any);
		};
	}, [codeSent]);

	useEffect(() => {
		sendCode();
	}, []);

	const sendCode = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await api.auth.resetPassword.request(email);
			if (!response.success) throw new Error(response.message || 'Failed to send code');
			setCodeSent(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to send code');
		} finally {
			setIsLoading(false);
		}
	};

	const resend = () => {
		if (countdown > 0) return;
		setCode('');
		sendCode();
	};

	const submitMail = async () => {
		if (code.length !== 6) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await api.auth.confirmMailAccount(email, code);
			if (!response.success) throw new Error(response.message || 'Failed to confirm mail');
			onConfirmComplete?.(true);
			onBack?.(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to confirm mail');
		} finally {
			setIsLoading(false);
		}
	};

	const canSubmitCode = true;

	return (
		<>
			<View style={styles.headerRow}>
				<Pressable onPress={() => onBack?.(false)} style={styles.backBtn} accessibilityRole="button">
					<ChevronLeft style={{ color: '#ffff' }}></ChevronLeft>
				</Pressable>
				<ThemedText type="title" style={[styles.title, { color: '#fff', marginLeft: 8 }]}>
					Confirm the email
				</ThemedText>
			</View>

			<View
				style={{
					width: '100%',
					display: 'flex',
					alignItems: 'center',
					gap: 5,
					paddingTop: 15,
				}}
			>
				{error && <ThemedText style={styles.error}>{error}</ThemedText>}
				<ThemedText style={{ color: '#fff' }}>Enter the 6-digit code</ThemedText>
				<TextInput
					placeholder="------"
					placeholderTextColor="#D1D5D8"
					keyboardType="number-pad"
					value={code}
					onChangeText={(v) => setCode(v.replace(/[^0-9]/g, '').slice(0, 6))}
					style={[styles.codeInput, { color: '#fff' }]}
					maxLength={6}
				/>

				<Pressable
					onPress={submitMail}
					disabled={!canSubmitCode || isLoading}
					style={[styles.actionBtn, !canSubmitCode || isLoading ? styles.actionBtnDisabled : null]}
					accessibilityRole="button"
				>
					{isLoading ? (
						<ActivityIndicator color="#fff" size="small" />
					) : (
						<ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>
							Valid mail
						</ThemedText>
					)}
				</Pressable>

				<Pressable
					onPress={resend}
					style={styles.resendBtn}
					accessibilityRole="button"
					disabled={countdown > 0}
				>
					<ThemedText type="link" style={{ color: '#fff' }}>
						{countdown > 0 ? `Resend (${countdown}s)` : 'Resend code'}
					</ThemedText>
				</Pressable>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '92%',
		maxWidth: 420,
		padding: 20,
		borderRadius: 16,
		alignItems: 'center',
		position: 'relative',
	},
	backBtn: {
		paddingVertical: 6,
		paddingHorizontal: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerRow: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
	},
	title: {
		marginTop: 8,
		marginBottom: 12,
	},
	inputWrapper: {
		marginTop: 8,
		width: '100%',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.12)',
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	input: {
		height: 44,
	},
	actionBtn: {
		marginTop: 14,
		width: '100%',
		paddingVertical: 16,
		paddingHorizontal: 14,
		borderRadius: 12,
		alignItems: 'center',
		backgroundColor: '#0a7ea4',
	},
	actionBtnDisabled: {
		backgroundColor: 'rgba(10,126,164,0.45)',
	},
	codeContainer: {
		marginTop: 16,
		alignItems: 'center',
		width: '100%',
		alignSelf: 'center',
	},
	codeInput: {
		marginTop: 8,
		height: 48,
		width: '60%',
		textAlign: 'center',
		fontSize: 20,
		letterSpacing: 6,
		borderBottomWidth: 1,
		borderColor: 'rgba(255,255,255,0.12)',
	},
	resendBtn: {
		marginTop: 10,
	},
	error: {
		marginTop: 6,
		marginBottom: 8,
		color: '#ff6b6b',
		textAlign: 'center',
	},
});
