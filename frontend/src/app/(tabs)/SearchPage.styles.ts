import { StyleSheet } from 'react-native';

const playlist = StyleSheet.create({
	playlistContainer: {
		width: '100%',
	},
	playlistContent: {
		paddingHorizontal: 4,
		gap: 10,
		flexDirection: 'row' as const,
	},
	playlistItem: {
		flexShrink: 0,
	},
});

const song = StyleSheet.create({
	songSection: {
		flex: 1,
		width: '100%',
		borderRadius: 15
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
		flex: 1
	},
	songListContent: {
		gap: 10,
		paddingBottom: 170,
		borderRadius: 15,
		padding: 10,
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
		color: 'rgba(255,255,255,0.5)'
	},
});

export const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
	searchRoot: {
		paddingTop: 10,
		flex: 1,
		width: '100%',
		backgroundColor: '#080b1a00'
	},
	searchContent: {
		flex: 1,
		width: '100%',
		paddingHorizontal: 14,
		paddingTop: 14,
		paddingBottom: 18
	},
	searchBar: {
		width: '100%',
		marginBottom: 14
	},
	searchBarContent: {
		paddingHorizontal: 14,
		paddingVertical: 10
	},
	searchInput: {
		color: '#fff',
		fontSize: 16,
		flex: 1,
		outlineWidth: 0,
		outlineColor: 'transparent'
	},
	sectionTitle: {
		color: '#fff',
		fontSize: 22,
		fontWeight: '700',
		marginBottom: 10,
		paddingLeft: 10,
	},
	sectionHeader: {
		flexDirection: 'row',
		gap: 20
	},
	resultsLayout: {
		flex: 1,
		flexDirection: 'row',
		gap: 10,
		minHeight: 0,
	},
	likedAlbumsSection: {
		width: '33%',
		minWidth: 220,
		minHeight: 0,
		paddingLeft: 8,
	},
	likedAlbumsScroll: {
		flex: 1,
	},
	likedAlbumsContent: {
		gap: 8,
		paddingBottom: 24,
	},
	likedAlbumItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		padding: 8,
		borderRadius: 14,
		backgroundColor: 'rgba(255,255,255,0.08)',
	},
	likedAlbumCover: {
		width: 58,
		height: 58,
		borderRadius: 10,
	},
	likedAlbumPlaceholder: {
		width: 58,
		height: 58,
		borderRadius: 10,
		backgroundColor: 'rgba(255,255,255,0.12)',
	},
	likedAlbumTitle: {
		flex: 1,
		fontSize: 13,
		fontWeight: '600',
	},
	emptyAlbumsText: {
		color: 'rgba(255,255,255,0.5)',
		fontSize: 13,
		padding: 8,
	},
	playlistCover: {
		height: 72, width: 72,
		borderRadius: 12
	},
	backgroundOverlay: {
		...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(4, 7, 18, 0.7)'
	},
	...playlist,
	...song,
	...loading,
});
