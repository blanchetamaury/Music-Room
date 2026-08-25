import { View } from 'react-native';
import LiquidGlass from '../../LiquidGlass';
import { ThemedText } from '../../themed-text';
import { Track } from '../data';
import { homeStyles } from '../home.styles';
import { useAuth } from '@/src/context/AuthContext';

export function HeaderSection({ currentTrack }: { currentTrack: Track }) {
	const { loading, user } = useAuth();

	return (
		<View style={homeStyles.headerRow}> {
			loading == false && user && (
				<>
					<View style={homeStyles.headerTextWrap}>
						<ThemedText type="title" style={homeStyles.welcomeText}>
							Welcome {user.username},
						</ThemedText>
						<ThemedText style={homeStyles.subText}>
							You are currently listening to{' '}
							<ThemedText style={homeStyles.subTextStrong}>{currentTrack.title}</ThemedText>
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
				</>
			)
		}
		</View>
	);
}
