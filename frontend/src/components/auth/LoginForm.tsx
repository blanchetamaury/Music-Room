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
	TextInput,
	View,
} from 'react-native';
import { useThemeColor } from '../../hooks/use-theme-color';
import LiquidGlass from '../LiquidGlass';
import { ThemedText } from '../themed-text';
import { FortyTwoIcon, GoogleIcon } from '../ui/icon';

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
	const [touchedEmail, setTouchedEmail] = useState(false);
	const [emailFocused, setEmailFocused] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { oauthFortyTwo, oauthGoogle } = useAuth();
	const router = useRouter();

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const isEmailValid = emailRegex.test(email);
	const isPasswordValid = password.length >= 6;
	const canSubmit = isEmailValid && isPasswordValid;

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
				<Pressable
					onPress={() => onRegister?.()}
					style={styles.topRightBtn}
					accessibilityRole="button"
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>
						Sign in
					</ThemedText>
				</Pressable>

				<ThemedText type="title" style={[styles.title, { color: '#fff' }]}>
					Log in
				</ThemedText>

				{error && <ThemedText style={styles.error}>{error}</ThemedText>}

				<View
					style={[
						styles.inputWrapper,
						touchedEmail && !isEmailValid && !emailFocused ? styles.inputInvalid : null,
					]}
				>
					<TextInput
						placeholder="Email"
						placeholderTextColor="#D1D5D8"
						value={email}
						onChangeText={(text) => {
							setEmail(text);
							setError(null);
						}}
						onFocus={() => setEmailFocused(true)}
						onBlur={() => {
							setEmailFocused(false);
							setTouchedEmail(true);
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
						accessibilityLabel="email"
					/>
				</View>
				{touchedEmail && !isEmailValid && !emailFocused && (
					<ThemedText style={styles.error}>Invalid email address</ThemedText>
				)}

				<View style={[styles.inputWrapper, styles.inputDistinct]}>
					<TextInput
						placeholder="Password"
						placeholderTextColor="#D1D5D8"
						value={password}
						onChangeText={(text) => {
							setPassword(text);
							setError(null);
						}}
						secureTextEntry={!showPassword}
						underlineColorAndroid="transparent"
						style={[
							styles.input,
							{ paddingRight: 48, color: '#fff' },
							Platform.OS === 'web'
								? ({
										outlineWidth: 0,
										outlineColor: 'transparent',
										outlineStyle: 'none',
									} as any)
								: null,
						]}
						accessibilityLabel="password"
					/>
					<Pressable
						onPress={() => setShowPassword((v) => !v)}
						style={styles.showBtn}
						accessibilityRole="button"
					>
						{showPassword != true && <EyeOff color={"#ffff"}></EyeOff>}
						{showPassword == true && <Eye color={"#ffff"}></Eye>}
					</Pressable>
				</View>

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

				<Pressable style={styles.googleBtn} accessibilityRole="button" onPress={handleoauthFortyTwo}>
					<FortyTwoIcon></FortyTwoIcon>
					<ThemedText>
						Log in with 42
					</ThemedText>
				</Pressable>

				<Pressable style={styles.googleBtn} accessibilityRole="button" onPress={handleoauthGoogle}>
					<GoogleIcon></GoogleIcon>
					<ThemedText>
						Log in with Google
					</ThemedText>
				</Pressable>

				<Pressable onPress={() => onForgot?.()} style={styles.forgotBtn} accessibilityRole="button">
					<ThemedText type="link" style={{ color: '#fff' }}>
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
	inputWrapper: {
		marginTop: 8,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.12)',
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	inputDistinct: {
		backgroundColor: 'rgba(255,255,255,0.03)',
	},
	inputInvalid: {
		borderColor: '#ff6b6b',
	},
	input: {
		height: 44,
	},
	glassOverlayInner: {
		position: 'absolute',
		inset: 0,
		backgroundColor: 'rgba(255,255,255,0.02)',
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
	googleBtn: {
		marginTop: 12,
		paddingVertical: 10,
		borderRadius: 12,
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.69)',
		flexDirection: 'row',
		gap: 10,
		justifyContent: 'center',
	},
	googleLogoPlaceholder: {
		width: 20,
		height: 20,
		backgroundColor: 'rgba(0,0,0,0.12)',
		borderRadius: 4,
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
	iconPlaceholder: {
		width: 20,
		height: 20,
		backgroundColor: 'rgba(255,255,255,0.2)',
		borderRadius: 4,
	},
	forgotBtn: {
		marginTop: 10,
		alignSelf: 'center',
	},
});
