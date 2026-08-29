import AuthBackground from '@/src/components/auth/AuthBackground';
import { LoginForm } from '@/src/components/auth/LoginForm';
import { Register } from '@/src/components/auth/Register';
import { ResetPassword } from '@/src/components/auth/ResetPassword';
import { ThemedView } from '@/src/components/themed-view';
import { useAuth } from '@/src/context/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export type AuthMode = 'login' | 'register' | 'reset-password';

const { width: SCREEN_W } = Dimensions.get('window');

export default function LoginScreen() {
	const router = useRouter();
	const searchParams = useLocalSearchParams<{ mode?: string }>();
	const { token, loading, login } = useAuth();
	const [error, setError] = useState<string | null>(null);
	const [mode, setMode] = useState<AuthMode>(() => {
    const modeParam = searchParams.mode;
		if (modeParam === 'register' || modeParam === 'reset-password' || modeParam === 'login') {
			return modeParam;
		}
		return 'login';
	});

	const modeIndex = mode === 'register' ? 0 : mode === 'login' ? 1 : 2;
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

	const loginStyle = useAnimatedStyle(() => {
		const tx = interpolate(progress.value, [-1, 0, 1], [SCREEN_W * 0.6, 0, -SCREEN_W * 0.6]);
		const op = interpolate(progress.value, [-1, 0, 1], [0, 1, 0]);
		return { transform: [{ translateX: tx }], opacity: op };
	});

	const resetStyle = useAnimatedStyle(() => {
		const tx = interpolate(progress.value, [-1, 0, 1], [SCREEN_W * 1.2, SCREEN_W * 0.6, 0]);
		const op = interpolate(progress.value, [-1, 0, 1], [0, 0, 1]);
		return { transform: [{ translateX: tx }], opacity: op };
	});

	const registerStyle = useAnimatedStyle(() => {
		const tx = interpolate(progress.value, [-1, 0, 1], [0, -SCREEN_W * 0.6, -SCREEN_W * 1.2]);
		const op = interpolate(progress.value, [-1, 0, 1], [1, 0, 0]);
		return { transform: [{ translateX: tx }], opacity: op };
	});

	const handleLogin = async (email: string, password: string) => {
		try {
			await login(email, password);
			router.replace('/(tabs)/home');
		} catch (err: unknown) {
			setError(`Email ou mot de passe incorrect [${err}]`);
		}
	};

	const handleAuthComplete = () => {
		router.replace('/(tabs)/home');
	};

	const handleModeChange = (newMode: AuthMode) => {
		setMode(newMode);
	};

	if (loading || token) {
		return null;
	}

	return (
		<ThemedView style={styles.container}>
			<AuthBackground />
			<Animated.View
				style={[{ position: 'absolute', width: '100%', alignItems: 'center' }, registerStyle]}
				pointerEvents={mode === 'register' ? 'auto' : 'none'}
			>
				<View style={styles.authContainer}>
					<Register onBack={() => handleModeChange('login')} onRegisterComplete={handleAuthComplete} onError={setError} error={error} />
				</View>
			</Animated.View>

			<Animated.View style={[{ position: 'absolute', width: '100%', alignItems: 'center' }, loginStyle]}>
				<View style={styles.container}>
					<View style={styles.center}>
						<LoginForm
							onLogin={handleLogin}
							onForgot={() => handleModeChange('reset-password')}
							onRegister={() => handleModeChange('register')}
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
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
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
});
