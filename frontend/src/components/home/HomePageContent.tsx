import { homeStyles } from '@/src/app/(tabs)/homes.styles';
import { View } from 'react-native';
import { HeaderSection } from './HeaderSection';
import { SongList } from './SongList';
import { UserStrip } from './UserStrip';

export function HomePageContent({ activeTrack, onSelect }: { activeTrack: number; onSelect: (index: number) => void }) {
	return (
		<View style={homeStyles.homeContent}>
				<HeaderSection currentTrack={null} />
				<UserStrip />
				<SongList activeTrack={activeTrack} onSelect={onSelect} />
		</View>
	);
}
