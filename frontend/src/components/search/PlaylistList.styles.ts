import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	playlistContainer: {
		flexShrink: 1,
		width: '25%',
		minWidth: 0,
		padding: 10,
		borderRadius: 8,
		backgroundColor: 'rgba(0, 0, 0, 0.75)',
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
		color: '#ffffff',
		fontSize: 24,
		fontWeight: '800',
		letterSpacing: 0.3,
		marginBottom: 14,
		paddingLeft: 10,
		textShadowColor: 'rgba(0, 0, 0, 0.4)',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 3,
	},
	playlistCover: {
		height: 48,
		width: 48,
		borderRadius: 12,
	},
});
