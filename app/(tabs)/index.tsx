import { HomePage } from '@/components/home/HomePage';
import { LoginForm } from '@/components/LoginForm';
import { MusicPreview } from '@/components/MusicPreview';
import { Register } from '@/components/Register';
import { ResetPassword } from '@/components/ResetPassword';
import { ThemedView } from '@/components/themed-view';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export default function LoginScreen() {
  const sample = [
    { color: '#ff7f50', title: 'React Beats', artist: 'Expo DJ' },
    { color: '#7ec8e3', title: 'Sunset Loop', artist: 'Wave Maker' },
    { color: '#9b59b6', title: 'Night Drive', artist: 'Synth Labs' },
  ];

  const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

  function rnd(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const DENSITY = 14;
  const animatedConfigs = Array.from({ length: DENSITY }).map(() => ({
    startX: rnd(0, SCREEN_W * 0.9),
    startY: SCREEN_H + rnd(10, 400),
    endY: -200,
    drift: rnd(-180, 180),
    duration: Math.floor(rnd(7000, 16000)),
    delay: Math.floor(rnd(0, 6000)),
  }));

  const [modeIndex, setModeIndex] = useState<0 | 1 | 2>(1);
  const [isHomeVisible, setIsHomeVisible] = useState(false);

  const handleLogin = () => {
    setIsHomeVisible(true);
  };

  const progress = useSharedValue(0);

  useEffect(() => {
    const target = modeIndex - 1;
    progress.value = withTiming(target, { duration: 420 });
  }, [modeIndex]);

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

  return (
    <ThemedView style={styles.container}>
      {!isHomeVisible ? (
        <>
          <View style={styles.fullOverlay} pointerEvents="none">
            {animatedConfigs.map((cfg, i) => (
              <MusicPreview
                key={`anim-${i}`}
                color={sample[i % sample.length].color}
                title={sample[i % sample.length].title}
                artist={sample[i % sample.length].artist}
                animationConfig={cfg}
              />
            ))}
          </View>

          <View style={styles.center}>
            <Animated.View
              style={[{ position: 'absolute', width: '100%', alignItems: 'center' }, registerStyle]}
              pointerEvents={modeIndex === 0 ? 'auto' : 'none'}
            >
              <Register
                onBack={() => setModeIndex(1)}
                onRegisterComplete={() => setIsHomeVisible(true)}
                onGoogle={() => console.log('google')}
              />
            </Animated.View>

            <Animated.View style={[{ position: 'absolute', width: '100%', alignItems: 'center' }, loginStyle]}>
              <LoginForm
                onLogin={handleLogin}
                onForgot={() => setModeIndex(2)}
                onGoogle={() => console.log('google')}
                onRegister={() => setModeIndex(0)}
              />
            </Animated.View>

            <Animated.View
              style={[{ position: 'absolute', width: '100%', alignItems: 'center' }, resetStyle]}
              pointerEvents={modeIndex === 2 ? 'auto' : 'none'}
            >
              <ResetPassword onBack={() => setModeIndex(1)} onResetComplete={() => setIsHomeVisible(true)} />
            </Animated.View>
          </View>
        </>
      ) : (
        <HomePage />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  fullOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    pointerEvents: 'none',
  },
});

