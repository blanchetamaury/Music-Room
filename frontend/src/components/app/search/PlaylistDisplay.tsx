import { Pressable, StyleSheet, View } from 'react-native';
import LiquidGlass from '../../LiquidGlass';
import { ThemedText } from '../../themed-text';

interface PlaylistProps {
	id: string;
	onPress?: () => void;
}

export function PlaylistDisplay({ id, onPress }: PlaylistProps) {
	return (
		<Pressable onPress={onPress}>
			<LiquidGlass
				style={style.playlistCard}
				contentStyle={style.playlistCardContent}
				intensity={18}
				radius={16}
				topLeftRadius={16}
				topRightRadius={16}
				bottomLeftRadius={16}
				bottomRightRadius={16}
			>
				<ThemedText style={style.playlistTitle}>{'Test'}</ThemedText>
				<View style={style.lowerPart}>
					<View style={style.playlistCover}></View>
					<ThemedText>{'8 musics'}</ThemedText>
				</View>
			</LiquidGlass>
		</Pressable>
	);
}

const style = StyleSheet.create({
	playlistCard: {
		flex: 1,
		height: 120,
		width: 160,
	},
	playlistCardContent: {
		flex: 1,
		padding: 12,
		flexDirection: 'column',
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
		width: 64,
		height: 64,
		borderRadius: 12,
		backgroundColor: '#6fc71c',
	},
	playlistMeta: {
		flex: 1,
		marginHorizontal: 10,
	},
	playlistSongCount: {
		color: 'rgba(255,255,255,0.72)',
		fontSize: 11,
	},
	lowerPart: {
		flexDirection: 'row',
		columnGap: 12,
	},
});
