import AuthBackground from '@/src/components/auth/AuthBackground';
import { ConfirmMail } from '@/src/components/auth/ConfirmMail';
import { LoginForm } from '@/src/components/auth/LoginForm';
import { Register } from '@/src/components/auth/Register';
import { ResetPassword } from '@/src/components/auth/ResetPassword';
import { ThemedView } from '@/src/components/utils/themed-view';
import { useAuth } from '@/src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
	Extrapolation,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';

export type AuthMode = 'login' | 'register' | 'reset-password' | 'verify-email';

const MODES: AuthMode[] = ['register', 'login', 'reset-password', 'verify-email'];

const { width: SCREEN_W } = Dimensions.get('window');

const isAuthMode = (value: string | undefined): value is AuthMode => MODES.includes(value as AuthMode);

export default function LoginScreen() {
	const router = useRouter();
	const searchParams = useLocalSearchParams<{ mode?: string }>();
	const { token, loading, login } = useAuth();
	const [error, setError] = useState<string | null>(null);
	const [verifyEmail, setVerifyEmail] = useState<string>('');
	const [mode, setMode] = useState<AuthMode>(() => {
		const modeParam = searchParams.mode;
		return isAuthMode(modeParam) ? modeParam : 'login';
	});

	const modeIndex = MODES.indexOf(mode);
	const progress = useSharedValue(modeIndex - 1);

	useEffect(() => {
		if (!loading && token) {
			router.replace('/(tabs)/home');
		}
	}, [loading, token, router]);

	useEffect(() => {
		const target = modeIndex - 1;
		progress.value = withTiming(target, { duration: 420 });
	}, [modeIndex, progress]);

	const usePanelStyle = (index: number) =>
		useAnimatedStyle(() => {
			const offset = index - 1 - progress.value;
			return {
				transform: [{ translateX: offset * SCREEN_W * 0.6 }],
				opacity: interpolate(Math.abs(offset), [0, 1], [1, 0], Extrapolation.CLAMP),
			};
		});

	const registerStyle = usePanelStyle(0);
	const loginStyle = usePanelStyle(1);
	const resetStyle = usePanelStyle(2);
	const verifyStyle = usePanelStyle(3);

	const handleLogin = async (email: string, password: string) => {
		await login(email, password);
		router.replace('/(tabs)/home');
	};

	const handleEmailVerificationRequired = (email: string) => {
		setError(null);
		setVerifyEmail(email);
		setMode('verify-email');
	};

	const handleAuthComplete = () => {
		router.replace('/(tabs)/home');
	};

	const handleModeChange = (newMode: AuthMode) => {
		setError(null);
		setMode(newMode);
	};

	if (loading || token) {
		return null;
	}

	return (
		<ThemedView style={[styles.container, styles.pageBackground]}>
			<LinearGradient
				colors={['#070712', '#15102d', '#071820']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={StyleSheet.absoluteFill}
			/>
			<AuthBackground />
			<Pressable
				accessibilityRole="button"
				accessibilityLabel="Retour à la page d'accueil"
				onPress={() => router.replace('/')}
				style={styles.backButton}
			>
				<ArrowLeft color="#fff" size={20} />
			</Pressable>
			<Animated.View
				style={[{ position: 'absolute', width: '100%', alignItems: 'center' }, registerStyle]}
				pointerEvents={mode === 'register' ? 'auto' : 'none'}
			>
				<View style={styles.authContainer}>
					<Register
						onBack={() => handleModeChange('login')}
						onRegisterComplete={handleAuthComplete}
						onError={setError}
						error={error}
					/>
				</View>
			</Animated.View>

			<Animated.View
				style={[{ position: 'absolute', width: '100%', alignItems: 'center' }, loginStyle]}
				pointerEvents={mode === 'login' ? 'auto' : 'none'}
			>
				<View style={styles.container}>
					<View style={styles.center}>
						<LoginForm
							onLogin={handleLogin}
							onForgot={() => handleModeChange('reset-password')}
							onRegister={() => handleModeChange('register')}
							onEmailVerificationRequired={handleEmailVerificationRequired}
						/>
					</View>
				</View>
			</Animated.View>

			<Animated.View
				style={[{ position: 'absolute', width: '100%', alignItems: 'center' }, resetStyle]}
				pointerEvents={mode === 'reset-password' ? 'auto' : 'none'}
			>
				<View style={styles.authContainer}>
					<ResetPassword onBack={() => handleModeChange('login')} onResetComplete={handleAuthComplete} />
				</View>
			</Animated.View>

			<Animated.View
				style={[{ position: 'absolute', width: '100%', alignItems: 'center' }, verifyStyle]}
				pointerEvents={mode === 'verify-email' ? 'auto' : 'none'}
			>
				<View style={styles.authContainer}>
					<ConfirmMail
						email={verifyEmail}
						onBack={() => handleModeChange('login')}
						onConfirmComplete={handleAuthComplete}
					/>
				</View>
			</Animated.View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	pageBackground: {
		backgroundColor: '#070712',
	},
	authContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	center: {
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
		zIndex: 10,
	},
	backButton: {
		position: 'absolute',
		top: 18,
		left: 18,
		width: 42,
		height: 42,
		borderRadius: 21,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(0,0,0,0.42)',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.18)',
		zIndex: 20,
	},
});
