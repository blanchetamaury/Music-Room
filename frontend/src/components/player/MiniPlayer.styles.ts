import { StyleSheet } from 'react-native';

export const MINI_PLAYER_BOTTOM_OFFSET = 96;

export const styles = StyleSheet.create({
	wrapper: {
		position: 'absolute',
		left: 12,
		right: 12,
		bottom: MINI_PLAYER_BOTTOM_OFFSET,
		zIndex: 50,
	},
	bar: {
		borderRadius: 20,
		minHeight: 68,
		overflow: 'hidden',
	},
	content: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingTop: 10,
		paddingBottom: 8,
	},
	cover: {
		width: 44,
		height: 44,
		borderRadius: 10,
		backgroundColor: 'rgba(255,255,255,0.12)',
	},
	coverFallback: {
		width: 44,
		height: 44,
		borderRadius: 10,
		backgroundColor: 'rgba(255,255,255,0.12)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	info: {
		flex: 1,
		marginHorizontal: 10,
	},
	title: {
		color: '#fff',
		fontSize: 14,
		fontWeight: '600',
	},
	artist: {
		color: 'rgba(255,255,255,0.65)',
		fontSize: 12,
		marginTop: 2,
	},
	unplayable: {
		color: 'rgba(255,255,255,0.6)',
		fontSize: 11,
		marginTop: 2,
	},
	controls: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2,
	},
	controlButton: {
		width: 38,
		height: 38,
		borderRadius: 19,
		alignItems: 'center',
		justifyContent: 'center',
	},
	controlPressed: {
		opacity: 0.6,
	},
	playButton: {
		width: 42,
		height: 42,
		borderRadius: 21,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255,255,255,0.16)',
	},
	playPressed: {
		opacity: 0.7,
	},
	disabled: {
		opacity: 0.35,
	},
	progressTrack: {
		height: 3,
		marginHorizontal: 12,
		borderRadius: 2,
		backgroundColor: 'rgba(255,255,255,0.14)',
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		backgroundColor: '#fff',
	},
	timeRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 14,
		paddingTop: 4,
		paddingBottom: 6,
	},
	time: {
		color: 'rgba(255,255,255,0.5)',
		fontSize: 10,
		fontVariant: ['tabular-nums'],
	},
	notice: {
		position: 'absolute',
		left: 12,
		right: 12,
		bottom: MINI_PLAYER_BOTTOM_OFFSET + 76,
		zIndex: 50,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 12,
		backgroundColor: 'rgba(20,20,24,0.94)',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: 'rgba(255,255,255,0.16)',
	},
	noticeText: {
		color: '#fff',
		fontSize: 12,
		flex: 1,
	},
});
