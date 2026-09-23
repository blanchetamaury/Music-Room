import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 8,
		borderRadius: 12,
	},
	cover: {
		width: 64,
		height: 64,
		borderRadius: 10,
		marginRight: 14,
	},
	coverPlaceholder: {
		width: 64,
		height: 64,
		borderRadius: 10,
		backgroundColor: 'rgba(255,255,255,0.1)',
		marginRight: 14,
	},
	info: {
		flex: 1,
		justifyContent: 'center',
	},
	title: {
		fontSize: 15,
		fontWeight: '600',
		marginBottom: 4,
		alignSelf: 'flex-start',
	},
	date: {
		fontSize: 13,
		color: 'rgba(255,255,255,0.5)',
	},
});
