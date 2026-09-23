import React, { useEffect, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet } from 'react-native';

interface PopupProps {
	children: React.ReactNode;
	onClose: () => void;
}

export function Popup({ children, onClose }: PopupProps) {
	const [progress] = useState(() => new Animated.Value(0));

	useEffect(() => {
		Animated.spring(progress, {
			toValue: 1,
			useNativeDriver: true,
			friction: 8,
			tension: 65,
		}).start();
	}, [progress]);

	return (
		<Modal
			visible
			transparent
			animationType="fade"
			onRequestClose={onClose}
			statusBarTranslucent
			navigationBarTranslucent
		>
			<Animated.View style={[styles.overlay, { opacity: progress }]}>
				<Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

				<Animated.View
					style={[
						styles.content,
						{
							transform: [
								{
									scale: progress.interpolate({
										inputRange: [0, 1],
										outputRange: [0.88, 1],
									}),
								},
							],
						},
					]}
				>
					{children}
				</Animated.View>
			</Animated.View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.65)',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 24,
	},

	content: {
		width: '100%',
		maxWidth: 800,
		borderRadius: 24,
		backgroundColor: '#151822',
		overflow: 'hidden',
		maxHeight: '80%',
	},
});
