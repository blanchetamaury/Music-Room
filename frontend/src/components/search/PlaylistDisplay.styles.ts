import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	wrapper: { flex: 1 },
	playlistCard: { flex: 1, height: 120, width: 160 },
	playlistCardContent: { flex: 1, padding: 12, flexDirection: 'column' },
	playlistTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 10 },
	playlistBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	playlistCover: {
		width: 64,
		height: 64,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 12,
		backgroundColor: '#1c36c7',
	},
	playlistMeta: { flex: 1, marginHorizontal: 10 },
	playlistSongCount: { color: 'rgba(255,255,255,0.72)', fontSize: 11 },
	lowerPart: { flexDirection: 'row', columnGap: 12 },
});
