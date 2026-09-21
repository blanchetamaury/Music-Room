import { StyleSheet } from 'react-native';

const playlist = StyleSheet.create({
	playlistContainer: {
		width: '100%',
		height: 125,
	},
	playlistContent: {
		paddingHorizontal: 4,
		gap: 10,
		flexDirection: 'row' as const,
	},
	playlistItem: {
		height: '100%',
		flexShrink: 0,
	},
});

const song = StyleSheet.create({
	songSection: {
		flex: 1,
		width: '100%',
		borderRadius: 15,
	},
	songListShell: {
		flex: 1,
		width: '100%',
		position: 'relative',
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
		overflow: 'hidden',
	},
	songListScroll: {
		flex: 1,
	},
	songListContent: {
		gap: 10,
		paddingBottom: 170,
		borderRadius: 15,
	},
	songListFade: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: 50,
		zIndex: 2,
	},
});

const loading = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		minHeight: 180,
		alignItems: 'center' as const,
		justifyContent: 'center' as const,
		gap: 10,
	},

	loadingText: {
		fontSize: 13,
		color: 'rgba(255,255,255,0.5)',
	},
});

export const searchStyles = StyleSheet.create({
	searchRoot: {
		paddingTop: 40,
		flex: 1,
		width: '100%',
		backgroundColor: '#080b1a00',
	},
	searchContent: {
		flex: 1,
		width: '100%',
		paddingHorizontal: 14,
		paddingTop: 28,
		paddingBottom: 18,
	},
	searchBar: {
		width: '100%',
		marginBottom: 14,
	},
	searchBarContent: {
		paddingHorizontal: 14,
		paddingVertical: 10,
	},
	searchInput: {
		color: '#fff',
		fontSize: 16,
		flex: 1,
		outlineWidth: 0,
		outlineColor: 'transparent',
	},

	sectionTitle: {
		color: '#fff',
		fontSize: 14,
		fontWeight: '700',
		marginBottom: 10,
	},
	backgroundOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(4, 7, 18, 0.7)',
	},
	...playlist,
	...song,
	...loading,
});
