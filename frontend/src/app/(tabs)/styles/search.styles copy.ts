import { StyleSheet } from 'react-native';

export const searchStyles = StyleSheet.create({
	homeFooter: {
		flex: -1,
		width: '100%',
		gap: 10,
		paddingHorizontal: 14,
		paddingTop: 28,
		paddingBottom: 18,
		zIndex: 3,
	},

	navGlyph: {
		width: 20,
		height: 20,
		borderRadius: 10,
	},
	catorContainer: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 12,
		height: 44,

		alignItems: 'center',
		justifyContent: 'center',

		pointerEvents: 'none',
	},
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
	playlistListShell: {
		position: 'relative',
		marginBottom: 14,
	},
	playlistListFade: {
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		width: 50,
		zIndex: 2,
	},
	playlistListScroll: {
		flex: 1,
	},
	playlistListContent: {
		gap: 12,
		paddingHorizontal: 0,
		paddingVertical: 4,
	},
	playlistCardWrapper: {
		width: 220,
	},
	playlistCard: {
		flex: 1,
		minHeight: 120,
	},
	playlistCardContent: {
		flex: 1,
		padding: 12,
	},
	playlistTitle: {
		color: '#fff',
		fontSize: 14,
		fontWeight: '600',
		marginBottom: 10,
	},
	playlistBottomRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	playlistCover: {
		width: 52,
		height: 52,
		borderRadius: 12,
	},
	playlistMeta: {
		flex: 1,
		marginHorizontal: 10,
	},
	playlistSongCount: {
		color: 'rgba(255,255,255,0.72)',
		fontSize: 11,
	},
	editButton: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 8,
		backgroundColor: 'rgba(255,255,255,0.1)',
	},
	editButtonText: {
		color: '#fff',
		fontSize: 11,
		fontWeight: '600',
	},
	playlistFadeContainer: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,

		zIndex: 10,

		pointerEvents: 'none',
	},

	playlistFadeLeft: {
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,

		width: 24,
	},

	playlistFadeRight: {
		position: 'absolute',
		right: 0,
		top: 0,
		bottom: 0,

		width: 24,
	},
});
