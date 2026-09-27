import { Platform, TextInput } from 'react-native';
import LiquidGlass from '../utils/LiquidGlass';
import { styles } from './SearchBar.styles';

interface SearchBarProps {
	setQuery: (value: string) => void;
	query?: string;
}

export function SearchBar(props: SearchBarProps) {
	return (
		<LiquidGlass
			style={styles.searchBar}
			contentStyle={styles.searchBarContent}
			intensity={30}
			radius={16}
			topLeftRadius={16}
			topRightRadius={16}
			bottomLeftRadius={16}
			bottomRightRadius={16}
			shimmer={false}
			chromatic={false}
		>
			<TextInput
				value={props.query}
				onChangeText={props.setQuery}
				placeholder="Search..."
				placeholderTextColor="rgba(255,255,255,0.5)"
				style={[
					styles.searchInput,
					Platform.OS === 'web' &&
						({
							outline: 'none',
							outlineWidth: 0,
							outlineStyle: 'none',
							boxShadow: 'none',
						} as any),
				]}
				autoCapitalize="none"
				autoCorrect={false}
				selectionColor="rgba(255,255,255,0.7)"
				underlineColorAndroid="transparent"
			/>
		</LiquidGlass>
	);
}
