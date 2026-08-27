import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
	searchRoot: {
		flex: 1,
		width: '100%',
		paddingTop: 40,
	},

	searchContent: {
		flex: 1,
		width: '100%',
		paddingHorizontal: 1,
		paddingTop: 20,
	},

	searchBar: {
		width: '100%',
		minHeight: 48,
		marginBottom: 12,
	},

	searchBarContent: {
		flex: 1,
		paddingHorizontal: 14,
		paddingVertical: 0,
		justifyContent: 'center' as const,
	},

	searchInput: {
		width: '100%',
		height: 46,
		paddingHorizontal: 0,
		paddingVertical: 0,
		margin: 0,
		color: '#fff',
		fontSize: 16,
		lineHeight: 20,
		textAlignVertical: 'center' as const,
	},

	playlistContainer: {
		position: 'relative' as const,
		width: '100%',
		height: 125,
	},

	playlistContent: {
		flex: 1,
		paddingHorizontal: 4,
		gap: 10,
	},

	playlistItem: {
		height: '100%',
		backgroundColor: "#fff",
	},

	playlistFades: {
		position: 'absolute' as const,
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
	},

	fadeLeft: {
		position: 'absolute' as const,
		left: 0,
		top: 0,
		bottom: 0,
		width: 28,
	},

	fadeRight: {
		position: 'absolute' as const,
		right: 0,
		top: 0,
		bottom: 0,
		width: 28,
	},

	songSection: {
		flex: 1,
		minHeight: 0,
		width: '100%',
	},

	songListShell: {
		flex: 1,
		minHeight: 0,
		width: '100%',
		borderRadius: 15,
		overflow: 'hidden' as const,
	},

	songListScroll: {
		flex: 1,
		width: '100%',
	},

	songListContent: {
		paddingTop: 10,
		paddingHorizontal: 8,
		paddingBottom: 150,
		gap: 8,
	},

	songListFade: {
		position: 'absolute' as const,
		top: 0,
		left: 0,
		right: 0,
		height: 4,
		zIndex: 2,
	},

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