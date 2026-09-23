import React, { useState } from 'react';
import {
	Animated,
	GestureResponderEvent,
	Platform,
	Pressable,
	StyleProp,
	ViewStyle,
} from 'react-native';

interface AnimatedPressableProps {
	children: React.ReactNode;
	onPress?: (event: GestureResponderEvent) => void;
	style?: StyleProp<ViewStyle>;
}

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

export function AnimatedPressable({ children, onPress, style }: AnimatedPressableProps) {
	const [scale] = useState(() => new Animated.Value(1));
	const [hovered, setHovered] = useState(false);

	const animateTo = (value: number) => {
		Animated.spring(scale, {
			toValue: value,
			useNativeDriver: true,
			friction: 8,
			tension: 120,
		}).start();
	};

	return (
		<AnimatedPressableBase
			onPress={onPress}
			onPressIn={() => animateTo(0.97)}
			onPressOut={() => animateTo(hovered ? 1.045 : 1)}
			onHoverIn={Platform.OS === 'web' ? () => {
				setHovered(true);
				animateTo(1.010);
			} : undefined}
			onHoverOut={Platform.OS === 'web' ? () => {
				setHovered(false);
				animateTo(1);
			} : undefined}
			style={[style, { transform: [{ scale }] }]}
		>
			{children}
		</AnimatedPressableBase>
	);
}