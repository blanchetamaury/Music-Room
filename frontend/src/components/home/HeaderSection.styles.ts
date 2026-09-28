import { StyleSheet } from 'react-native';

const playlist = StyleSheet.create({
	playlistBadge: {
		width: 62,
		height: 62,
		borderRadius: 18,
		marginLeft: 10,
	},
	playlistBadgeContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	playlistLogo: {
		width: 44,
		height: 44,
		borderRadius: 14,
		backgroundColor: '#f6b26b',
		shadowColor: '#000',
		shadowOpacity: 0.25,
		shadowRadius: 12,
	},
});

export const styles = StyleSheet.create({
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	headerTextWrap: {
		flex: 1,
		paddingRight: 8,
	},
	welcomeText: {
		fontSize: 24,
		lineHeight: 30,
		color: '#fff',
		fontWeight: '700',
		textAlign: 'left',
	},
	subText: {
		fontSize: 12,
		color: 'rgba(255,255,255,0.72)',
		marginTop: 4,
	},
	subTextStrong: {
		color: '#fff',
		fontWeight: '600',
	},
	...playlist,
});
