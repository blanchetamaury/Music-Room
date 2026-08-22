import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useThemeColor } from '../../hooks/use-theme-color';
import { api } from '../../lib/api/client';
import LiquidGlass from '../LiquidGlass';
import { ThemedText } from '../themed-text';

export function ResetPassword({ onBack, onResetComplete }: { onBack?: () => void; onResetComplete?: () => void }) {
	const [email, setEmail] = useState('');
	const [codeSent, setCodeSent] = useState(false);
	const [code, setCode] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [countdown, setCountdown] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const timerRef = useRef<number | null>(null);

	const reveal = useSharedValue(0);

	const formBg = useThemeColor({ light: 'rgba(255, 255, 255, 0.72)', dark: 'rgba(18, 18, 18, 0.75)' }, 'background');

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
			setNewPassword('');
			setConfirmPassword('');
		}
		return () => {
			if (timerRef.current) clearInterval(timerRef.current as any);
		};
	}, [codeSent]);

	const revealStyle = useAnimatedStyle(() => {
		return {
			opacity: reveal.value,
			transform: [{ translateX: (1 - reveal.value) * 30 }],
		};
	});

	const sendCode = async () => {
		if (!email) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await api.auth.resetPassword.request(email);
			if (!response.success) {
				throw new Error(response.message || 'Failed to send reset code');
			}
			setCodeSent(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to send reset code');
		} finally {
			setIsLoading(false);
		}
	};

	const resend = () => {
		if (countdown > 0) return;
		setCode('');
		sendCode();
	};

	const submitReset = async () => {
		if (code.length !== 6 || !newPassword || newPassword !== confirmPassword) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await api.auth.resetPassword.verify(email, code, newPassword);
			if (!response.success) {
				throw new Error(response.message || 'Failed to reset password');
			}
			onResetComplete?.();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to reset password');
		} finally {
			setIsLoading(false);
		}
	};

	const canSubmitCode = code.length === 6 && newPassword.length >= 6 && newPassword === confirmPassword;

	return (
		<LiquidGlass
			style={[styles.container, { backgroundColor: formBg }]}
			radius={16}
			topLeftRadius={16}
			topRightRadius={16}
			bottomLeftRadius={16}
			bottomRightRadius={16}
		>
			<View style={styles.headerRow}>
				<Pressable onPress={() => onBack?.()} style={styles.backBtn} accessibilityRole="button">
					<ChevronLeft color={'#ffff'}></ChevronLeft>
				</Pressable>
				<ThemedText type="title" style={[styles.title, { color: '#fff', marginLeft: 8 }]}>
					Reset password
				</ThemedText>
			</View>

			{error && <ThemedText style={styles.error}>{error}</ThemedText>}

			{!codeSent ? (
				<>
					<View style={styles.inputWrapper}>
						<TextInput
							placeholder="Email"
							placeholderTextColor="#D1D5D8"
							value={email}
							onChangeText={(text) => {
								setEmail(text);
								setError(null);
							}}
							keyboardType="email-address"
							autoCapitalize="none"
							underlineColorAndroid="transparent"
							style={[
								styles.input,
								{ color: '#fff' },
								Platform.OS === 'web'
									? ({
											outlineWidth: 0,
											outlineColor: 'transparent',
											outlineStyle: 'none',
										} as any)
									: null,
							]}
						/>
					</View>

					<Pressable
						onPress={sendCode}
						disabled={!email || isLoading}
						style={[styles.actionBtn, !email || isLoading ? styles.actionBtnDisabled : null]}
						accessibilityRole="button"
					>
						{isLoading ? (
							<ActivityIndicator color="#fff" size="small" />
						) : (
							<ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>
								Send code
							</ThemedText>
						)}
					</Pressable>
				</>
			) : (
				<Animated.View style={[styles.codeContainer, revealStyle]} pointerEvents={codeSent ? 'auto' : 'none'}>
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

					<View style={styles.inputWrapper}>
						<TextInput
							placeholder="New password"
							placeholderTextColor="#D1D5D8"
							value={newPassword}
							onChangeText={(text) => {
								setNewPassword(text);
								setError(null);
							}}
							secureTextEntry
							underlineColorAndroid="transparent"
							style={[
								styles.input,
								{ color: '#fff' },
								Platform.OS === 'web'
									? ({
											outlineWidth: 0,
											outlineColor: 'transparent',
											outlineStyle: 'none',
										} as any)
									: null,
							]}
						/>
					</View>

					<View style={styles.inputWrapper}>
						<TextInput
							placeholder="Confirm password"
							placeholderTextColor="#D1D5D8"
							value={confirmPassword}
							onChangeText={(text) => {
								setConfirmPassword(text);
								setError(null);
							}}
							secureTextEntry
							underlineColorAndroid="transparent"
							style={[
								styles.input,
								{ color: '#fff' },
								Platform.OS === 'web'
									? ({
											outlineWidth: 0,
											outlineColor: 'transparent',
											outlineStyle: 'none',
										} as any)
									: null,
							]}
						/>
					</View>

					<Pressable
						onPress={submitReset}
						disabled={!canSubmitCode || isLoading}
						style={[styles.actionBtn, !canSubmitCode || isLoading ? styles.actionBtnDisabled : null]}
						accessibilityRole="button"
					>
						{isLoading ? (
							<ActivityIndicator color="#fff" size="small" />
						) : (
							<ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>
								Reset password
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
				</Animated.View>
			)}
		</LiquidGlass>
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
