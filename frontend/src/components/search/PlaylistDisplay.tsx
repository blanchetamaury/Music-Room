import { View } from 'react-native';
import { ReactNode } from 'react';
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
		<View style={[styles.wrapper, { padding: 5, backgroundColor: '#1f1f1f' }, debugBox('#ff0000')]}>
			<View style={[styles.lowerPart, debugBox('#0088ff')]}>
				<View style={{ height: '100%', alignContent: 'center', justifyContent: 'center' }}>
					<View
						style={[
							styles.playlistCover,
							debugBox('#00ffff'),
							{ backgroundColor: `${props.backgroundColorCover}` },
						]}
					>
						{props.children}
					</View>
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
		</View>
	);
}

export function PlaylistDisplayAdd() {
	return (
		<View
			style={[
				styles.wrapper,
				{
					flexDirection: 'row',
					justifyContent: 'center',
					alignItems: 'center',
					borderRadius: 15,
					paddingHorizontal: 10,
					paddingTop: 10,
					backgroundColor: '#333333',
				},
				debugBox('#ff0000'),
			]}
		>
			<Plus style={[styles.playlistTitle, { width: 16, height: 16 }, debugBox('#ffff00')]}></Plus>
			<ThemedText style={[styles.playlistTitle, { fontSize: 12 }, debugBox('#ffff00')]}>Add</ThemedText>
		</View>
	);
}
