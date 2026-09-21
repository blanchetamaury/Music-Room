import { View } from 'react-native';

import { ReactNode } from 'react';
import LiquidGlass from '../utils/LiquidGlass';
import { ThemedText } from '../utils/themed-text';
import { styles } from './PlaylistDisplay.styles';

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

export function PlaylistDisplay(props: PlaylistProps) {
	return (
		<View style={[styles.wrapper, debugBox('#ff0000')]}>
			<LiquidGlass
				style={[styles.playlistCard, debugBox('#ff8800')]}
				contentStyle={[styles.playlistCardContent, debugBox('#00ff00')]}
				intensity={18}
				radius={16}
				topLeftRadius={16}
				topRightRadius={16}
				bottomLeftRadius={16}
				bottomRightRadius={16}
			>
				<ThemedText style={[styles.playlistTitle, debugBox('#ffff00')]}>{props.title}</ThemedText>

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

					<ThemedText style={debugBox('#ff00ff')}>{props.size}</ThemedText>
				</View>
			</LiquidGlass>
		</View>
	);
}
