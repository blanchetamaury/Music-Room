import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	useColorScheme,
	View,
} from 'react-native';
import { useThemeColor } from '../../hooks/use-theme-color';
import LiquidGlass from '../LiquidGlass';
import { ThemedText } from '../themed-text';
import { FortyTwoIcon, GoogleIcon } from '../ui/icon';
import { InputPasswordForm } from '../InputPasswordForm';
import { InputForm } from '../InputForm';

export function LoginForm({
	onLogin,
	onForgot,
	onRegister,
}: {
	onLogin?: (email: string, password: string) => Promise<void>;
	onForgot?: () => void;
	onGoogle?: () => void;
	onRegister?: () => void;
}) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { oauthFortyTwo, oauthGoogle } = useAuth();
	const router = useRouter();
	const colorScheme = useColorScheme();

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const canSubmit = emailRegex.test(email) && password.length >= 6;

	const glassBg = useThemeColor({ light: 'rgba(255, 255, 255, 0.72)', dark: 'rgba(18, 18, 18, 0.75)' }, 'background');

	const handleSubmit = async () => {
		if (!canSubmit || isLoading) return;

		setIsLoading(true);
		setError(null);

		try {
			await onLogin?.(email, password);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Login failed');
		} finally {
			setIsLoading(false);
		}
	};

	const handleoauthFortyTwo = async () => {
		try {
			await oauthFortyTwo();
			router.replace('/(tabs)/home');
		} catch (err) {
			console.error('Login error:', err);
		}
	};

	const handleoauthGoogle = async () => {
		try {
			await oauthGoogle();
			router.replace('/(tabs)/home');
		} catch (err) {
			console.error('Login error:', err);
		}
	};

	return (
		<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrapper}>
			<LiquidGlass
				style={[styles.form, { backgroundColor: glassBg }]}
				radius={16}
				topLeftRadius={16}
				topRightRadius={16}
				bottomLeftRadius={16}
				bottomRightRadius={16}
			>
				<ThemedText
					type="title"
					style={[styles.title, { color: `${colorScheme === 'light' ? '#000000' : '#ffffff'}`, height: 40 }]}
				>
					Log in
				</ThemedText>

				<Pressable
					onPress={() => onRegister?.()}
					style={styles.topRightBtn}
					accessibilityRole="button"
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<ThemedText
						type="defaultSemiBold"
						style={{ color: `${colorScheme === 'light' ? '#000000' : '#ffffff'}` }}
					>
						Sign in
					</ThemedText>
				</Pressable>

				{error && <ThemedText style={styles.error}>{error}</ThemedText>}

				<InputForm placeholder="Email" inputValue={email} setInputValue={setEmail} setError={setError} />

				<InputPasswordForm
					placeholder="Password"
					inputValue={password}
					showInputValue={showPassword}
					setInputValue={setPassword}
					setError={setError}
				>
					<Pressable
						onPress={() => setShowPassword((v) => !v)}
						style={styles.showBtn}
						accessibilityRole="button"
					>
						{showPassword != true && (
							<EyeOff color={colorScheme === 'light' ? '#000000' : '#ffffff'}></EyeOff>
						)}
						{showPassword == true && <Eye color={colorScheme === 'light' ? '#000000' : '#ffffff'}></Eye>}
					</Pressable>
				</InputPasswordForm>

				<Pressable
					onPress={handleSubmit}
					disabled={!canSubmit || isLoading}
					style={[styles.loginBtn, !canSubmit || isLoading ? styles.loginBtnDisabled : null]}
					accessibilityRole="button"
				>
					{isLoading ? (
						<ActivityIndicator color="#fff" size="small" />
					) : (
						<ThemedText
							type="defaultSemiBold"
							style={[styles.loginBtnText, !canSubmit ? { opacity: 0.6 } : null]}
						>
							Log in
						</ThemedText>
					)}
				</Pressable>

				<View style={styles.separatorRow}>
					<View style={styles.separatorLine} />
					<ThemedText style={styles.separatorText}>or</ThemedText>
					<View style={styles.separatorLine} />
				</View>

				<Pressable
					style={colorScheme === 'light' ? styles.darkBtn : styles.ligthBtn}
					accessibilityRole="button"
					onPress={handleoauthFortyTwo}
				>
					<FortyTwoIcon></FortyTwoIcon>
					<ThemedText
						style={{
							color: Platform.select({
								web: '#000000',
								default: colorScheme === 'dark' ? '#0000' : '#ffff',
							}),
						}}
					>
						Log in with 42
					</ThemedText>
				</Pressable>

				<Pressable
					style={colorScheme === 'light' ? styles.darkBtn : styles.ligthBtn}
					accessibilityRole="button"
					onPress={handleoauthGoogle}
				>
					<GoogleIcon></GoogleIcon>
					<ThemedText
						style={{
							color: Platform.select({
								web: '#000000',
								default: colorScheme === 'dark' ? '#0000' : '#ffff',
							}),
						}}
					>
						Log in with Google
					</ThemedText>
				</Pressable>

				<Pressable onPress={() => onForgot?.()} style={styles.forgotBtn} accessibilityRole="button">
					<ThemedText type="link" style={{ color: `${colorScheme === 'light' ? '#000000' : '#ffffff'}` }}>
						Forgot password?
					</ThemedText>
				</Pressable>
			</LiquidGlass>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		width: '100%',
		alignItems: 'center',
	},
	form: {
		width: '92%',
		maxWidth: 420,
		padding: 22,
		borderRadius: 16,
		shadowColor: '#000',
		shadowOpacity: 0.12,
		shadowRadius: 10,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.12)',
		overflow: 'hidden',
	},
	title: {
		marginBottom: 12,
	},
	error: {
		marginTop: 6,
		marginBottom: 8,
		color: '#ff6b6b',
		textAlign: 'center',
	},
	showBtn: {
		position: 'absolute',
		right: 12,
		top: 0,
		bottom: 0,
		justifyContent: 'center',
	},
	loginBtn: {
		marginTop: 18,
		paddingVertical: 12,
		borderRadius: 12,
		alignItems: 'center',
		backgroundColor: '#0a7ea4',
	},
	loginBtnDisabled: {
		backgroundColor: 'rgba(10,126,164,0.45)',
	},
	loginBtnText: {
		color: '#fff',
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
		backgroundColor: 'rgba(0,0,0,0.08)',
	},
	separatorText: {
		opacity: 0.8,
	},
	darkBtn: {
		paddingLeft: 10,
		paddingRight: 10,
		marginTop: 12,
		paddingVertical: 10,
		borderRadius: 12,
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.69)',
		flexDirection: 'row',
		gap: 10,
		justifyContent: 'center',
	},
	ligthBtn: {
		paddingLeft: 10,
		paddingRight: 10,
		marginTop: 12,
		paddingVertical: 10,
		borderRadius: 12,
		alignItems: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.69)',
		flexDirection: 'row',
		gap: 10,
		justifyContent: 'center',
	},
	topRightBtn: {
		position: 'absolute',
		right: 12,
		top: 12,
		paddingVertical: 6,
		paddingHorizontal: 10,
		minWidth: 44,
		minHeight: 44,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 20,
		elevation: 6,
	},
	forgotBtn: {
		marginTop: 10,
		alignSelf: 'center',
	},
});
