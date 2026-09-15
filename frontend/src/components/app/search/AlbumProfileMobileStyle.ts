import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
	container: {
		width: '100%',
		height: "100%",
		padding: 28,
	},

	albumHeader: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 24,
	},

	coverContainer: {
		width: 150,
		height: 150,
		flexShrink: 0,
	},

	cover: {
		width: '100%',
		height: '100%',
		borderRadius: 20,
	},

	coverPlaceholder: {
		width: '100%',
		height: '100%',
		borderRadius: 20,
		backgroundColor: 'rgba(255,255,255,0.08)',
	},

	albumInfo: {
		flex: 1,
		minWidth: 0,
		justifyContent: 'center',
	},

	titleWrapper: {
		width: '100%',
		overflow: 'hidden',
	},

	titleScrollContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},

	titleScrollCentered: {
		justifyContent: 'flex-start',
	},

	titleContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},

	titleDuplicate: {
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 50,
	},

	albumTitle: {
		fontSize: 26,
		fontWeight: '700',
		color: '#fff',
	},

	albumArtist: {
		marginTop: 8,
		fontSize: 16,
		color: 'rgb(255, 255, 255)',
	},

	albumStats: {
		marginTop: 16,
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 12,
	},

	infoItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
	},

	infoText: {
		fontSize: 13,
		color: 'rgba(255,255,255,0.6)',
	},

	trackHeader: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginTop: 20,
		marginBottom: 10,
	},

	trackTitle: {
		fontSize: 18,
		fontWeight: '700',
	},

	trackCount: {
		fontSize: 13,
		color: 'rgba(255,255,255,0.4)',
	},

	trackList: {
		width: '100%',
		gap: 4,
		paddingBottom: 10,
	},

	track: {
		width: '100%',
		minHeight: 48,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 10,
		borderRadius: 10,
	},

	trackPositionContainer: {
		width: 32,
		alignItems: 'center',
		justifyContent: 'center',
	},

	trackPosition: {
		fontSize: 13,
		color: 'rgba(255,255,255,0.35)',
	},

	trackInfo: {
		flex: 1,
		minWidth: 0,
		paddingHorizontal: 8,
	},

	trackName: {
		fontSize: 15,
		color: 'rgba(255,255,255,0.85)',
	},

	trackDuration: {
		width: 55,
		alignItems: 'flex-end',
	},

	trackDurationText: {
		fontSize: 13,
		color: 'rgba(255,255,255,0.4)',
	},

	footer: {
		width: '100%',
		minHeight: 42,
		marginTop: 18,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 20,
	},

	footerItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		maxWidth: '50%',
	},

	footerLabel: {
		fontSize: 12,
		color: 'rgba(255,255,255,0.35)',
	},

	footerValue: {
		flexShrink: 1,
		fontSize: 13,
		color: 'rgba(255,255,255,0.6)',
	},

	loadingContainer: {
		width: '100%',
		padding: 32,
		justifyContent: 'center',
		alignItems: 'center',
	},

	loading: {
		color: 'rgba(255,255,255,0.5)',
	},
});
