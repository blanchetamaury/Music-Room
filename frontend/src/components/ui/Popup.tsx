import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

interface PopupProps {
	children: React.ReactNode;
	onClose: () => void;
}

export function Popup({ children, onClose }: PopupProps) {
	return (
		<Modal visible={true} transparent animationType="fade" onRequestClose={onClose}>
			<View style={styles.overlay}>
				<Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

				<View style={styles.content}>{children}</View>
			</View>
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
		maxWidth: 700,
		maxHeight: '90%',
		borderRadius: 24,
		backgroundColor: '#151822',
		overflow: 'hidden',
	},
});
