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

    const DENSITY = 14; // increased density
    const animatedConfigs = Array.from({ length: DENSITY }).map(() => ({
        startX: rnd(0, SCREEN_W * 0.9),
        startY: SCREEN_H + rnd(10, 400),
        endY: -200,
        drift: rnd(-180, 180),
        duration: Math.floor(rnd(7000, 16000)),
        delay: Math.floor(rnd(0, 6000)),
    }));

    const [modeIndex, setModeIndex] = useState<0 | 1 | 2>(1); // 0 = register, 1 = login, 2 = reset

    const handleLogin = (email: string, password: string) => {
        console.log('login', { email, password });
    };

    const progress = useSharedValue(0); // -1 register, 0 login, 1 reset

    useEffect(() => {
        const target = (modeIndex - 1) as number; // -1 | 0 | 1
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
            {/* Full-screen overlay for animated previews */}
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
                <Animated.View style={[{ position: 'absolute', width: '100%', alignItems: 'center' }, registerStyle]} pointerEvents={modeIndex === 0 ? 'auto' : 'none'}>
                    <Register onBack={() => setModeIndex(1)} onRegisterComplete={() => setModeIndex(1)} onGoogle={() => console.log('google')} />
                </Animated.View>

                <Animated.View style={[{ position: 'absolute', width: '100%', alignItems: 'center' }, loginStyle]}>
                    <LoginForm onLogin={handleLogin} onForgot={() => setModeIndex(2)} onGoogle={() => console.log('google')} onRegister={() => setModeIndex(0)} />
                </Animated.View>

                <Animated.View style={[{ position: 'absolute', width: '100%', alignItems: 'center' }, resetStyle]} pointerEvents={modeIndex === 2 ? 'auto' : 'none'}>
                    <ResetPassword onBack={() => setModeIndex(1)} onResetComplete={() => setModeIndex(1)} />
                </Animated.View>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    background: {
        position: 'absolute',
        top: 80,
        left: 16,
        right: 16,
        opacity: 0.9,
    },
    row: {
        paddingHorizontal: 8,
        alignItems: 'center',
    },
    center: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10,
    },
    hint: {
        marginTop: 12,
        opacity: 0.85,
    },
    fullOverlay: {
        ...StyleSheet.absoluteFillObject,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'none',
    },
});
