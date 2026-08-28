import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
	container: {
		width: '100%',
		flex: 1,
		padding: 24,
	},

	header: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 20,
		paddingVertical: 4,
	},

	avatarContainer: {
		width: 110,
		height: 110,
		flexShrink: 0,
	},

	avatar: {
		width: '100%',
		height: '100%',
		borderRadius: 55,
	},

	avatarPlaceholder: {
		width: '100%',
		height: '100%',
		borderRadius: 55,
		backgroundColor:
			'rgba(255,255,255,0.08)',
	},

	artistInfo: {
		flex: 1,
		minWidth: 0,
		justifyContent: 'center',
	},

	name: {
		fontSize: 26,
		fontWeight: '700',
		color: '#fff',
	},

	artistStats: {
		marginTop: 12,
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 10,
	},

	infoItem: {
		flexDirection: 'row',
		alignItems: 'center',
	},

	infoText: {
		fontSize: 13,
		color: 'rgba(255,255,255,0.6)',
	},

	dot: {
		fontSize: 6,
		color: 'rgba(255,255,255,0.3)',
	},

	tabs: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginTop: 18,
		marginBottom: 12,
	},

	tab: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 7,
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 10,
	},

	tabActive: {
		backgroundColor:
			'rgba(255,255,255,0.1)',
	},

	tabText: {
		fontSize: 14,
		fontWeight: '600',
		color: 'rgba(255,255,255,0.5)',
	},

	tabTextActive: {
		color: '#fff',
	},

	tabCount: {
		fontSize: 12,
		color: 'rgba(255,255,255,0.3)',
	},

	tabCountActive: {
		color: 'rgba(255,255,255,0.55)',
	},

	content: {
		flex: 1,
		minHeight: 0,
		width: '100%',
	},

	trackList: {
		width: '100%',
		gap: 6,
		paddingBottom: 20,
	},

	albumList: {
		width: '100%',
		gap: 10,
		paddingBottom: 20,
	},

	empty: {
		width: '100%',
		paddingVertical: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},

	emptyText: {
		fontSize: 14,
		color: 'rgba(255,255,255,0.4)',
	},

	loadingContainer: {
		width: '100%',
		flex: 1,
		padding: 32,
		alignItems: 'center',
		justifyContent: 'center',
	},

	loading: {
		fontSize: 14,
		color: 'rgba(255,255,255,0.5)',
	},

	errorText: {
		fontSize: 14,
		color: 'rgba(255,255,255,0.6)',
	},
});