import { View } from 'react-native';

import { useAuth } from '@/src/context/AuthContext';
import { DeezerTrack } from '@/src/types/deezer/deezer';

import LiquidGlass from '../../LiquidGlass';
import { ThemedText } from '../../themed-text';
import { homeStyles } from '../home.styles';

interface HeaderSectionProps {
	currentTrack: DeezerTrack | null;
}

export function HeaderSection({ currentTrack }: HeaderSectionProps) {
	const { loading, user } = useAuth();

	if (loading || !user) {
		return <View style={homeStyles.headerRow} />;
	}

	return (
		<View style={homeStyles.headerRow}>
			<View style={homeStyles.headerTextWrap}>
				<ThemedText type="title" style={homeStyles.welcomeText}>
					Welcome {user.username},
				</ThemedText>

				<ThemedText style={homeStyles.subText}>
					{currentTrack ? (
						<>
							You are currently listening to{' '}
							<ThemedText style={homeStyles.subTextStrong}>
								{currentTrack.title}
							</ThemedText>
						</>
					) : (
						'No music playing'
					)}
				</ThemedText>
			</View>

			<LiquidGlass
				style={homeStyles.playlistBadge}
				contentStyle={homeStyles.playlistBadgeContent}
				intensity={16}
				radius={18}
				topLeftRadius={18}
				topRightRadius={18}
				bottomLeftRadius={18}
				bottomRightRadius={18}
			>
				<View style={homeStyles.playlistLogo} />
			</LiquidGlass>
		</View>
	);
}