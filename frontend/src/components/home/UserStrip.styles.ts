import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	userSection: {
		width: '100%',
		backgroundColor: 'rgba(0, 0, 0, 0.75)',
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
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 12,
		paddingHorizontal: 4,
		borderRadius: 8,
		borderStyle: 'solid',
		borderWidth: 1,
		borderColor: '#ffffff18',
	},
	userBubbleContent: {
		
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
