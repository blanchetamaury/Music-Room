import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	playlistContainer: {
		flexShrink: 1,
		width: '25%',
		minWidth: 0,
		padding: 10,
		borderRadius: 8,
		backgroundColor: 'rgb(19, 19, 19)',
	},
	playlistContent: {
		width: '100%',
		paddingHorizontal: 4,
		gap: 10,
		flexDirection: 'column' as const,
	},
	playlistItem: {
		flexShrink: 0,
		position: 'relative',
	},
	menuButton: {
		position: 'absolute',
		top: 8,
		right: 8,
		width: 28,
		height: 28,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 14,
		backgroundColor: 'rgba(0,0,0,0.55)',
	},
	sectionTitle: {
		color: '#fff',
		fontSize: 22,
		fontWeight: '700',
		marginBottom: 10,
		paddingLeft: 10,
	},
	playlistCover: {
		height: 72,
		width: 72,
		borderRadius: 12,
	},
});
