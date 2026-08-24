import { StyleSheet } from 'react-native';

export const homeStyles = StyleSheet.create({
	homeRoot: {
		flex: 1,
		width: '100%',
		backgroundColor: '#080b1a',
		overflow: 'hidden',
	},
	backgroundOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(4, 7, 18, 0.7)',
	},
	homeContent: {
		flex: 1,
		width: '100%',
		paddingHorizontal: 14,
		paddingTop: 28,
		paddingBottom: 18,
		zIndex: 1,
	},
	homeFooter: {
		flex: -1,
		width: '100%',
		gap: 10,
		paddingHorizontal: 14,
		paddingTop: 28,
		paddingBottom: 18,
		zIndex: 3,
	},
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
	separator: {
		height: 1,
		backgroundColor: 'rgba(255,255,255,0.15)',
		marginVertical: 14,
	},
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
	songCard: {
		borderRadius: 20,
		minHeight: 74,
	},
	songCardActive: {
		borderWidth: 1,
		borderRadius: 20,
	},
	songCardContent: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 10,
	},
	songCover: {
		width: 52,
		height: 52,
		borderRadius: 14,
		marginRight: 12,
	},
	songInfo: {
		flex: 1,
		justifyContent: 'center',
	},
	songTitle: {
		color: '#fff',
		fontSize: 12,
		fontWeight: '600',
		marginBottom: 2,
	},
	songArtist: {
		color: 'rgba(255,255,255,0.72)',
		fontSize: 11,
	},
	reorderBtn: {
		width: 30,
		height: 30,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 10,
		backgroundColor: 'rgba(255,255,255,0.05)',
	},
	reorderIcon: {
		color: '#fff',
		fontSize: 22,
		lineHeight: 22,
	},
	navBar: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		minHeight: 82,
		maxHeight: 82,
		paddingHorizontal: 14,
		paddingTop: 12,
		paddingBottom: 18,
		zIndex: 30,
		borderTopLeftRadius: 28,
		borderTopRightRadius: 28,
	},
	navBarContent: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-around',
		width: '100%',
		height: '100%',
	},
	navButton: {
		width: 44,
		height: 44,
		borderRadius: 22,
		alignItems: 'center',
		justifyContent: 'center',
	},
	navButtonActive: {
		backgroundColor: 'rgba(255,255,255,0.12)',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.26)',
	},
	navIndicator: {
		position: 'absolute',
		bottom: 4,
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: '#fff',
		alignSelf: 'center',
	},
	navGlyph: {
		width: 20,
		height: 20,
		borderRadius: 10,
	},
	playerWrap: {
		position: 'absolute',
		left: 16,
		right: 16,
		bottom: 104,
		zIndex: 45,
	},
	playerCard: {
		borderRadius: 20,
		minHeight: 72,
	},
	playerContent: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 14,
		paddingVertical: 10,
	},
	playerControls: {
		width: 42,
		alignItems: 'center',
		justifyContent: 'center',
	},
	playPauseButton: {
		width: 34,
		height: 34,
		borderRadius: 17,
		alignItems: 'center',
		justifyContent: 'center',
	},
	playPauseButtonInner: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	playPauseButtonPressed: {
		opacity: 0.7,
	},
	playText: {
		color: '#fff',
		fontSize: 12,
	},
	playerInfo: {
		flex: 1,
		marginLeft: 10,
	},
	playerTitle: {
		color: '#fff',
		fontWeight: '700',
		fontSize: 13,
	},
	playerArtist: {
		color: 'rgba(255,255,255,0.75)',
		fontSize: 11,
		marginTop: 2,
	},
	playerCover: {
		width: 42,
		height: 42,
		borderRadius: 12,
		marginLeft: 12,
	},
	navIndicatorContainer: {
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
