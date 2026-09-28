import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	sectionTitle: {
		color: '#fff',
		fontSize: 14,
		fontWeight: '700',
		marginBottom: 10,
	},
	songSection: {
		flex: 1,
		width: '100%',
		borderRadius: 8,
	},
	songListShell: {
		flex: 1,
		width: '100%',
		position: 'relative',
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
		minHeight: 74,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 8,
		borderStyle: 'solid',
		borderWidth: 1,
		borderColor: '#ffffff18',
	},
	songCardActive: {
		borderWidth: 1,
		borderColor: '#ffffff67',
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
});
