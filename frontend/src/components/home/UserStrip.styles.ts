import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	userSection: {
		width: '100%',
	},
	sectionTitle: {
		color: '#fff',
		fontSize: 14,
		fontWeight: '700',
		marginBottom: 10,
	},
	userListContent: {
		paddingRight: 12,
		gap: 8,
		alignItems: 'flex-start',
	},
	userBubble: {
		width: 60,
		minHeight: 88,
		borderRadius: 18,
	},
	userBubbleContent: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 12,
		paddingHorizontal: 4,
	},
	avatar: {
		width: 34,
		height: 34,
		borderRadius: 17,
		marginBottom: 8,
	},
	userName: {
		fontSize: 11,
		color: '#fff',
		textAlign: 'center',
	},
});
