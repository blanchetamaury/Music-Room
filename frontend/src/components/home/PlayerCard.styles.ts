import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
	scrollingTextContainer: {
		width: '100%',
		overflow: 'hidden',
	},

	scrollingContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},

	textRow: {
		flexDirection: 'row',
		alignItems: 'center',
		flexShrink: 0,
	},

	textRowDuplicate: {
		flexDirection: 'row',
		alignItems: 'center',
		flexShrink: 0,
		marginLeft: 40,
	},
});
