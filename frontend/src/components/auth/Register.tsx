import { ChevronRight, Eye, EyeOff } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, TextInput, useColorScheme, View } from 'react-native';
import { useThemeColor } from '../../hooks/use-theme-color';
import { api } from '../../lib/api/client';
import LiquidGlass from '../LiquidGlass';
import { ThemedText } from '../themed-text';
import { ConfirmMail } from './ConfirmMail';
import { InputPasswordForm } from '../InputPasswordForm';
import { InputForm } from '../InputForm';

function checkRules(pw: string) {
	const hasUpper = /[A-Z]/.test(pw);
	const hasNumber = /[0-9]/.test(pw);
	const hasSpecial = /[^A-Za-z0-9]/.test(pw);
	return { hasUpper, hasNumber, hasSpecial };
}

export function Register({ onBack, onRegisterComplete }: { onBack?: () => void; onRegisterComplete?: () => void }) {
	const [email, setEmail] = useState('');
	const [page, setPage] = useState<boolean>(false);
	const [confirmMailAccount, setConfirmMailAccount] = useState<boolean>(false);
	const [username, setUsername] = useState('');
	const [pw, setPw] = useState('');
	const [confirm, setConfirm] = useState('');
	const [touchedConfirm, setTouchedConfirm] = useState(false);
	const [showPw, setShowPw] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const rules = useMemo(() => checkRules(pw), [pw]);
	const colorScheme = useColorScheme();
	const completed = [rules.hasUpper, rules.hasNumber, rules.hasSpecial].filter(Boolean).length;

	const formBg = useThemeColor({ light: 'rgba(255, 255, 255, 0.72)', dark: 'rgba(18, 18, 18, 0.75)' }, 'background');
	const isPasswordValid = pw.length >= 6 && confirm === pw && completed === 3;

	useEffect(() => {
		const handleSubmit = async () => {
			if (!isPasswordValid || isLoading) return;

			setIsLoading(true);
			setError(null);

			try {
				const response = await api.auth.signup(email, pw, username);

				if (!response.success) {
					throw new Error(response.message || 'Registration failed');
				}

				onRegisterComplete?.();
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Registration failed');
			} finally {
				setIsLoading(false);
			}
		};
		if (confirmMailAccount == true) {
			handleSubmit();
		}
	}, [confirmMailAccount]);

	return (
		<LiquidGlass
			style={[styles.container, { backgroundColor: formBg }]}
			radius={16}
			topLeftRadius={16}
			topRightRadius={16}
			bottomLeftRadius={16}
			bottomRightRadius={16}
		>
			{page == false && (
				<>
					<Pressable onPress={() => onBack?.()} style={styles.topRightBtn} accessibilityRole="button">
						<ChevronRight color={`${colorScheme === 'light' ? '#000000' : '#ffffff'}`}></ChevronRight>
					</Pressable>

					<ThemedText type="title" style={[styles.title, { color: `${colorScheme === 'light' ? '#000000' : '#ffffff'}` }]}>
						Create account
					</ThemedText>

					{error && <ThemedText style={styles.error}>{error}</ThemedText>}

					<InputForm placeholder="Email" inputValue={email} setInputValue={setEmail} setError={setError} />
					<InputForm placeholder="Username" inputValue={username} setInputValue={setUsername} setError={setError} />

					<InputPasswordForm
						placeholder="Password"
						inputValue={pw}
						showInputValue={showPw}
						setInputValue={setPw}
						setError={setError}
					>
						<Pressable
							onPress={() => setShowPw((v) => !v)}
							style={styles.showBtn}
							accessibilityRole="button"
						>
							{showPw != true && (
								<EyeOff color={colorScheme === 'light' ? '#000000' : '#ffffff'}></EyeOff>
							)}
							{showPw == true && <Eye color={colorScheme === 'light' ? '#000000' : '#ffffff'}></Eye>}
						</Pressable>
					</InputPasswordForm>

					<View style={styles.rulesRow}>
						<View
							style={[
								styles.ruleBar,
								{
									width: `${Math.min(100, Math.round(((completed + (pw.length > 0 ? 1 : 0)) / 4) * 100))}%`,
									backgroundColor: completed === 3 ? '#4ade80' : '#ff6b6b',
								},
							]}
						/>
					</View>
					<View style={styles.rulesList}>
						<ThemedText style={{ color: rules.hasUpper ? `${colorScheme === 'light' ? '#000000' : '#ffffff'}` : `${colorScheme === 'light' ? '#1e1e1e91' : '#ddd'}` }}>
							{rules.hasUpper ? '✓' : '•'} One uppercase letter
						</ThemedText>
						<ThemedText style={{ color: rules.hasNumber ? `${colorScheme === 'light' ? '#000000' : '#ffffff'}` : `${colorScheme === 'light' ? '#1e1e1e91' : '#ddd'}` }}>
							{rules.hasNumber ? '✓' : '•'} One number
						</ThemedText>
						<ThemedText style={{ color: rules.hasSpecial ? `${colorScheme === 'light' ? '#000000' : '#ffffff'}` : `${colorScheme === 'light' ? '#1e1e1e91' : '#ddd'}` }}>
							{rules.hasSpecial ? '✓' : '•'} One special character
						</ThemedText>
					</View>

					<InputPasswordForm
						placeholder="Confirm password"
						inputValue={confirm}
						showInputValue={showConfirm}
						setInputValue={setConfirm}
						setError={setError}
					>
						<Pressable
							onPress={() => setShowConfirm((v) => !v)}
							style={styles.showBtn}
							accessibilityRole="button"
						>
							{showConfirm != true && (
								<EyeOff color={colorScheme === 'light' ? '#000000' : '#ffffff'}></EyeOff>
							)}
							{showConfirm == true && <Eye color={colorScheme === 'light' ? '#000000' : '#ffffff'}></Eye>}
						</Pressable>
					</InputPasswordForm>

					{touchedConfirm && confirm !== pw && (
						<ThemedText style={styles.error}>Passwords do not match</ThemedText>
					)}

					<View style={styles.separatorRow}>
						<View style={styles.separatorLine} />
						<ThemedText style={{ color: colorScheme === 'light' ? '#000000' : '#ffffff' }}>or</ThemedText>
						<View style={styles.separatorLine} />
					</View>

					<Pressable
						style={[styles.createBtn, !isPasswordValid ? { opacity: 0.55 } : null]}
						onPress={() => setPage(true)}
						accessibilityRole="button"
						disabled={!isPasswordValid || isLoading}
					>
						{isLoading ? (
							<ActivityIndicator color={colorScheme === 'light' ? '#000000' : '#ffffff'} size="small" />
						) : (
							<ThemedText style={{ color: '#ffffff', fontWeight: '600' }}>Create account</ThemedText>
						)}
					</Pressable>

					<Pressable onPress={() => onBack?.()} style={styles.signInLink} accessibilityRole="button">
						<ThemedText style={{ color: colorScheme === 'light' ? '#000000' : '#ffffff', fontSize: 13 }}>
							Already have an account ? <ThemedText type="defaultSemiBold">Log in</ThemedText>
						</ThemedText>
					</Pressable>
				</>
			)}
			{page == true && (
				<ConfirmMail email={email} onBack={setPage} onConfirmComplete={setConfirmMailAccount}></ConfirmMail>
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
		alignItems: 'stretch',
	},
	topRightBtn: {
		position: 'absolute',
		right: 10,
		top: 0,
	},
	title: {
		marginTop: 8,
		marginBottom: 12,
		color: '#fff',
	},
	inputWrapper: {
		marginTop: 8,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.12)',
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	input: {
		height: 44,
	},
	pwToggle: {
		position: 'absolute',
		right: 12,
		top: 0,
		bottom: 0,
		justifyContent: 'center',
	},
	showBtn: {
		position: 'absolute',
		right: 12,
		top: 0,
		bottom: 0,
		justifyContent: 'center',
	},
	inputDistinct: {
		backgroundColor: 'rgba(255,255,255,0.03)',
	},
	inputInvalid: {
		borderColor: '#ff6b6b',
	},
	error: {
		marginTop: 6,
		marginBottom: 8,
		color: '#ff6b6b',
		textAlign: 'center',
	},
	iconPlaceholder: {
		width: 20,
		height: 20,
		backgroundColor: 'rgba(255,255,255,0.2)',
		borderRadius: 4,
	},
	rulesRow: {
		height: 8,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		borderRadius: 6,
		marginTop: 10,
		overflow: 'hidden',
	},
	ruleBar: {
		height: '100%',
	},
	rulesList: {
		marginTop: 8,
		gap: 6,
	},
	separatorRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		marginTop: 14,
	},
	separatorLine: {
		height: 1,
		flex: 1,
		backgroundColor: 'rgba(255,255,255,0.12)',
	},
	googleBtn: {
		marginTop: 12,
		paddingVertical: 10,
		borderRadius: 12,
		alignItems: 'center',
		backgroundColor: 'rgba(255,255,255,0.06)',
		flexDirection: 'row',
		gap: 10,
		justifyContent: 'center',
	},
	googleLogoPlaceholder: {
		width: 20,
		height: 20,
		backgroundColor: 'rgba(255,255,255,0.2)',
		borderRadius: 4,
	},
	createBtn: {
		marginTop: 14,
		paddingVertical: 12,
		borderRadius: 12,
		alignItems: 'center',
		backgroundColor: 'rgba(58, 225, 255, 0.12)',
	},
	signInLink: {
		marginTop: 12,
		alignSelf: 'center',
	},
});
