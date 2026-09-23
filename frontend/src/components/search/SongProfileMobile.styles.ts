import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		width: '100%',
		padding: 28,
		alignItems: 'center',
	},
	albumButton: {
		width: '100%',
		alignItems: 'center',
		marginBottom: 20,
	},
	albumTitle: {
		fontSize: 16,
		fontWeight: '500',
		color: 'rgba(255,255,255,0.7)',
	},
	coverContainer: {
		width: 220,
		height: 220,
		alignItems: 'center',
		justifyContent: 'center',
	},
	cover: {
		width: 220,
		height: 220,
		borderRadius: 20,
	},
	titleContainer: {
		width: '100%',
		marginTop: 22,
		justifyContent: 'center',
	},
	scrollingTitleWrapper: {
		width: '100%',
		overflow: 'hidden',
		alignItems: 'center',
	},
	scrollingTitleCentered: {
		alignItems: 'center',
	},
	titleScrollContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	titleScrollCentered: {
		justifyContent: 'center',
	},
	titleContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	titleDuplicate: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginLeft: 40,
	},
	title: {
		fontSize: 24,
		fontWeight: '700',
		color: '#fff',
	},
	artistsContainer: {
		width: '100%',
		marginTop: 10,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		alignItems: 'center',
	},
	artistWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	artist: {
		fontSize: 15,
		color: 'rgba(255,255,255,0.65)',
	},
	artistSeparator: {
		marginHorizontal: 5,
		fontSize: 14,
		color: 'rgba(255,255,255,0.35)',
	},
	actions: {
		width: '100%',
		marginTop: 18,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
	},
	actionButton: {
		width: 42,
		height: 42,
		borderRadius: 21,
		alignItems: 'center',
		justifyContent: 'center',
	},
	playButton: {
		width: 52,
		height: 52,
		borderRadius: 26,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255,255,255,0.15)',
	},
	stats: {
		width: '100%',
		marginTop: 18,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
	},
	statItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
	},
	statLabel: {
		fontSize: 12,
		color: 'rgba(255,255,255,0.55)',
	},
	statSeparator: {
		width: 1,
		height: 12,
		backgroundColor: 'rgba(255,255,255,0.2)',
	},
});
