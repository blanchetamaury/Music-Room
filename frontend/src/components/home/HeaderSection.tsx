import { useAuth } from '@/src/context/AuthContext';
import { DeezerTrack } from '@/src/types/deezer/deezer';
import { View } from 'react-native';
import LiquidGlass from '../utils/LiquidGlass';
import { ThemedText } from '../utils/themed-text';
import { styles } from './HeaderSection.styles';

interface HeaderSectionProps {
	currentTrack: DeezerTrack | null;
}

export function HeaderSection({ currentTrack }: HeaderSectionProps) {
	const { loading, user } = useAuth();

	if (loading || !user) {
		return <View style={styles.headerRow} />;
	}

	return (
		<View style={styles.headerRow}>
			<View style={styles.headerTextWrap}>
				<ThemedText type="title" style={styles.welcomeText}>
					Welcome {user.username},
				</ThemedText>

				<ThemedText style={styles.subText}>
					{currentTrack ? (
						<>
							You are currently listening to{' '}
							<ThemedText style={styles.subTextStrong}>{currentTrack.title}</ThemedText>
						</>
					) : (
						'No music playing'
					)}
				</ThemedText>
			</View>

			<LiquidGlass
				style={styles.playlistBadge}
				contentStyle={styles.playlistBadgeContent}
				intensity={16}
				radius={18}
				topLeftRadius={18}
				topRightRadius={18}
				bottomLeftRadius={18}
				bottomRightRadius={18}
			>
				<View style={styles.playlistLogo} />
			</LiquidGlass>
		</View>
	);
}
