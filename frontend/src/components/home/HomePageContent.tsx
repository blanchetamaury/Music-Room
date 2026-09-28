import { homeStyles } from '@/src/app/(tabs)/homes.styles';
import { View } from 'react-native';
import { SeparatorFull } from '../ui/separator';
import LiquidGlass from '../utils/LiquidGlass';
import { HeaderSection } from './HeaderSection';
import { SongList } from './SongList';
import { UserStrip } from './UserStrip';

export function HomePageContent({ activeTrack, onSelect }: { activeTrack: number; onSelect: (index: number) => void }) {
	return (
		<LiquidGlass
			style={homeStyles.homeContent}
			contentStyle={homeStyles.homeContentInner}
			intensity={18}
			radius={16}
			topLeftRadius={16}
			topRightRadius={16}
			bottomLeftRadius={16}
			bottomRightRadius={16}
		>
			<HeaderSection currentTrack={null} />
			<SeparatorFull />
			<UserStrip />
			<View style={homeStyles.separator} />
			<SongList activeTrack={activeTrack} onSelect={onSelect} />
		</LiquidGlass>
	);
}
