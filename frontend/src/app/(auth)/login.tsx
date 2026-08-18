import AuthBackground from '@/src/components/auth/AuthBackground';
import { LoginForm } from '@/src/components/auth/LoginForm';
import { Register } from '@/src/components/auth/Register';
import { ResetPassword } from '@/src/components/auth/ResetPassword';
import { ThemedView } from '@/src/components/themed-view';
import { api } from '@/src/lib/api/client';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';

export type AuthMode = 'login' | 'register' | 'reset-password';

const { width: SCREEN_W } = Dimensions.get('window');

function LoginScreenInner({
  onLogin,
  onForgot,
  onGoogle,
  onRegister,
}: {
  onLogin: (email: string, password: string) => Promise<void>;
  onForgot: () => void;
  onGoogle: () => void;
  onRegister: () => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <LoginForm
          onLogin={onLogin}
          onForgot={onForgot}
          onGoogle={onGoogle}
          onRegister={onRegister}
        />
      </View>
    </View>
  );
}

function RegisterScreenInner({
  onBack,
  onRegisterComplete,
}: {
  onBack: () => void;
  onRegisterComplete: () => void;
}) {
  return (
    <View style={styles.authContainer}>
      <Register
        onBack={onBack}
        onRegisterComplete={onRegisterComplete}
      />
    </View>
  );
}

function ResetPasswordScreenInner({
  onBack,
  onResetComplete,
}: {
  onBack: () => void;
  onResetComplete: () => void;
}) {
  return (
    <View style={styles.authContainer}>
      <ResetPassword
        onBack={onBack}
        onResetComplete={onResetComplete}
      />
    </View>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isAuthed, setIsAuthed] = useState(false);

  const modeIndex = mode === 'register' ? 0 : mode === 'login' ? 1 : 2;
  const progress = useSharedValue(modeIndex - 1);

  useEffect(() => {
    const target = modeIndex - 1;
    progress.value = withTiming(target, { duration: 420 });
  }, [modeIndex]);

  useEffect(() => {
    const modeParam = searchParams.mode;
    if (modeParam === 'register' || modeParam === 'reset-password' || modeParam === 'login') {
      setMode(modeParam);
    }
  }, [searchParams.mode]);

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
      const response = await api.auth.login(email, password);
      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }
      handleAuthComplete();
    } catch (err) {
      // Error is handled in LoginForm component
      console.error('Login error:', err);
    }
  };

  const handleRegisterComplete = () => {
    handleAuthComplete();
  };

  const handleResetComplete = () => {
    handleAuthComplete();
  };

  const handleAuthComplete = () => {
    setIsAuthed(true);
    router.replace('/(tabs)/home');
  };

  const handleGoogleAuth = () => {
    const url = api.auth.oauthFortyTwo();
    window.location.href = url;
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
  };

  if (isAuthed) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <AuthBackground />
      <Animated.View
        style={[{ position: 'absolute', width: '100%', alignItems: 'center' }, registerStyle]}
        pointerEvents={mode === 'register' ? 'auto' : 'none'}
      >
        <RegisterScreenInner
          onBack={() => handleModeChange('login')}
          onRegisterComplete={handleRegisterComplete}
        />
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', width: '100%', alignItems: 'center' }, loginStyle]}>
        <LoginScreenInner
          onLogin={handleLogin}
          onForgot={() => handleModeChange('reset-password')}
          onGoogle={handleGoogleAuth}
          onRegister={() => handleModeChange('register')}
        />
      </Animated.View>

      <Animated.View
        style={[{ position: 'absolute', width: '100%', alignItems: 'center' }, resetStyle]}
        pointerEvents={mode === 'reset-password' ? 'auto' : 'none'}
      >
        <ResetPasswordScreenInner
          onBack={() => handleModeChange('login')}
          onResetComplete={handleResetComplete}
        />
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