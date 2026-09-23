import React, { useState } from 'react';
import { Animated, GestureResponderEvent, Platform, Pressable, StyleProp, ViewStyle } from 'react-native';

interface AnimatedPressableProps {
	children: React.ReactNode;
	onPress?: (event: GestureResponderEvent) => void;
	style?: StyleProp<ViewStyle>;
}

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

export function AnimatedPressable({ children, onPress, style }: AnimatedPressableProps) {
	const [scale] = useState(() => new Animated.Value(1));
	const [brightness] = useState(() => new Animated.Value(0));
	const [hovered, setHovered] = useState(false);

	const animateTo = (value: number) => {
		Animated.spring(scale, {
			toValue: value,
			useNativeDriver: true,
			friction: 8,
			tension: 120,
		}).start();
	};

	const animateBrightnessTo = (value: number) => {
		Animated.timing(brightness, {
			toValue: value,
			duration: 150,
			useNativeDriver: true,
		}).start();
	};

	return (
		<AnimatedPressableBase
			onPress={onPress}
			onPressIn={() => animateTo(0.97)}
			onPressOut={() => animateTo(hovered ? 1.045 : 1)}
			onHoverIn={
				Platform.OS === 'web'
					? () => {
							setHovered(true);
							animateTo(1.01);
							animateBrightnessTo(1);
						}
					: undefined
			}
			onHoverOut={
				Platform.OS === 'web'
					? () => {
							setHovered(false);
							animateTo(1);
							animateBrightnessTo(0);
						}
					: undefined
			}
			style={[style, { transform: [{ scale }] }]}
		>
			{children}
			<Animated.View
				pointerEvents="none"
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					borderRadius: 12,
					backgroundColor: '#fff',
					opacity: brightness.interpolate({
						inputRange: [0, 1],
						outputRange: [0, 0.08],
					}),
				}}
			/>
		</AnimatedPressableBase>
	);
}
