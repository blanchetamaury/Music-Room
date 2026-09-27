import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';

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
					<LinearGradient
						colors={['rgba(180,77,255,0.12)', 'rgba(62,207,255,0.03)', 'transparent']}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={styles.contentGradient}
						pointerEvents="none"
					/>
					<View style={styles.children}>{children}</View>
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
		maxWidth: 860,
		borderRadius: 16,
		backgroundColor: '#131316',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.09)',
		overflow: 'hidden',
		maxHeight: '88%',
	},
	contentGradient: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: '100%',
	},
	children: {
		zIndex: 1,
	},
});
