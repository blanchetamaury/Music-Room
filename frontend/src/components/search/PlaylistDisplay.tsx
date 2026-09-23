import { View } from 'react-native';

import { ReactNode } from 'react';
import LiquidGlass from '../utils/LiquidGlass';
import { ThemedText } from '../utils/themed-text';
import { styles } from './PlaylistDisplay.styles';
import { Plus } from 'lucide-react-native';

interface PlaylistProps {
	id?: string;
	title?: string;
	size?: number;
	duration?: number;
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

export function PlaylistDisplay(props: PlaylistProps) {
	const duration = props.duration ?? 0;
	const durationLabel = `${Math.floor(duration / 60)}m ${(duration % 60).toString().padStart(2, '0')}s`;
	return (
		<View style={[styles.wrapper, debugBox('#ff0000')]}>
			<LiquidGlass
				style={[styles.playlistCard, debugBox('#ff8800')]}
				contentStyle={[
					styles.playlistCardContent,
					{ justifyContent: 'center', padding: 5 },
					debugBox('#00ff00'),
				]}
				intensity={18}
				radius={8}
				topLeftRadius={8}
				topRightRadius={8}
				bottomLeftRadius={8}
				bottomRightRadius={8}
			>
				<View style={[styles.lowerPart, debugBox('#0088ff')]}>
					<View
						style={[
							styles.playlistCover,
							debugBox('#00ffff'),
							{ backgroundColor: `${props.backgroundColorCover}` },
						]}
					>
						{props.children}
					</View>
					<View style={{ flexDirection: 'column', flex: 1 }}>
						<ThemedText style={[styles.playlistTitle, debugBox('#ffff00')]}>{props.title}</ThemedText>
						<View
							style={{
								flex: 1,
								justifyContent: 'space-between',
								flexDirection: 'row',
								gap: 10,
								padding: 5,
							}}
						>
							<ThemedText style={styles.playlistSongCount}>{props.size} tracks</ThemedText>
							<ThemedText style={styles.playlistSongCount}>{durationLabel}</ThemedText>
						</View>
					</View>
				</View>
			</LiquidGlass>
		</View>
	);
}

export function PlaylistDisplayAdd() {
	return (
		<View style={[styles.wrapper, debugBox('#ff0000')]}>
			<LiquidGlass
				style={[styles.playlistCard, debugBox('#ff8800')]}
				contentStyle={[
					styles.playlistCardContent,
					{ alignItems: 'center', justifyContent: 'center', padding: 5, width: '100%' },
					debugBox('#00ff00'),
				]}
				intensity={18}
				radius={8}
				topLeftRadius={8}
				topRightRadius={8}
				bottomLeftRadius={8}
				bottomRightRadius={8}
			>
				<ThemedText style={[styles.playlistTitle, { fontSize: 20 }, debugBox('#ffff00')]}>playlists</ThemedText>
				<Plus style={[styles.playlistTitle, { width: 16, height: 16 }, debugBox('#ffff00')]}></Plus>
			</LiquidGlass>
		</View>
	);
}
