import { Pressable, StyleSheet, View } from 'react-native';

import { ReactNode } from 'react';
import LiquidGlass from '../../LiquidGlass';
import { ThemedText } from '../../themed-text';

interface PlaylistProps {
	id?: string;
	title?: string;
	size?: number;
	backgroundColorCover: string;
	children?: ReactNode;
	onPress?: () => void;
}

const DEBUG = false;

const debugBox = (color: string) => {
	if (!DEBUG) {
		return {};
	}

	return {
		borderWidth: 2,
		borderColor: color,
		backgroundColor: `${color}22`,
	};
};

export function PlaylistDisplay(props : PlaylistProps) {
	console.log('[PlaylistDisplay]', JSON.stringify({ props }, null, 2));

	return (
		<Pressable
			onPress={props.onPress}
			style={debugBox('#ff0000')}
		>
			<LiquidGlass
				style={[
					style.playlistCard,
					debugBox('#ff8800'),
				]}
				contentStyle={[
					style.playlistCardContent,
					debugBox('#00ff00'),
				]}
				intensity={18}
				radius={16}
				topLeftRadius={16}
				topRightRadius={16}
				bottomLeftRadius={16}
				bottomRightRadius={16}
			>
				<ThemedText
					style={[
						style.playlistTitle,
						debugBox('#ffff00'),
					]}
				>
					{props.title}
				</ThemedText>

				<View
					style={[
						style.lowerPart,
						debugBox('#0088ff'),
					]}
				>
					<View style={[style.playlistCover, debugBox('#00ffff'), {backgroundColor: `${props.backgroundColorCover}`} ]}>
						{props.children}
					</View>

					<ThemedText
						style={debugBox('#ff00ff')}
					>
						{props.size}
					</ThemedText>
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
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 12,
		backgroundColor: '#1c36c7',
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