import { StyleSheet } from 'react-native';

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

export const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
	searchRoot: {
		flex: 1,
		width: '100%',
		backgroundColor: '#080b1a00',
	},
	searchContent: {
		flex: 1,
		width: '100%',
	},
	sectionTitle: {
		color: '#fff',
		fontSize: 22,
		fontWeight: '700',
		marginBottom: 10,
		paddingLeft: 10,
	},
	desktopLayout: {
		flexDirection: 'column',
		flex: 1,
		gap: 10,
		minHeight: 0,
		alignItems: 'center',
		paddingTop: 15,
	},
	mainColumn: {
		width: '100%',
		flexDirection: 'row',
		flex: 1,
		minWidth: 0,
		minHeight: 0,
		alignItems: 'stretch',
		paddingLeft: 20,
		paddingRight: 20,
		paddingBottom: 10,
		gap: 10,
	},
	likedAlbumsSection: {
		width: '25%',
		minWidth: 220,
		minHeight: 0,
		position: 'relative',
		alignSelf: 'stretch',
	},
	likedAlbumsGradient: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: -18,
		width: 20,
	},
	likedAlbumsScroll: {
		flex: 1,
	},
	likedAlbumsContent: {
		gap: 8,
		paddingBottom: 100,
	},
	likedAlbumItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		padding: 8,
		borderRadius: 8,
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
	albumMeta: {
		color: 'rgba(255,255,255,0.55)',
		fontSize: 11,
		marginTop: 3,
	},
	emptyAlbumsText: {
		color: 'rgba(255,255,255,0.5)',
		fontSize: 13,
		padding: 8,
	},
	backgroundOverlay: {
		...StyleSheet.absoluteFillObject,
	},
	...loading,
});
