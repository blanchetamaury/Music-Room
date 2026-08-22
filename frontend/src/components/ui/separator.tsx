import { useColorScheme } from '@/src/hooks/use-color-scheme.web';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

type SeparatorProps = {
	sepText: string;
};

export function Separator(props: SeparatorProps) {
	const colorScheme = useColorScheme();

	return (
		<View style={styles.separatorRow}>
			<View style={styles.separatorLine} />
			<ThemedText style={{ color: colorScheme === 'light' ? '#000000' : '#ffffff' }}>{props.sepText}</ThemedText>
			<View style={styles.separatorLine} />
		</View>
	);
}

export function SeparatorFull() {
	return (
		<View style={styles.separatorRow}>
			<View style={styles.separatorLine} />
		</View>
	);
}

const styles = StyleSheet.create({
	separatorRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		marginTop: 14,
	},
	separatorLine: {
		height: 1,
		flex: 1,
		backgroundColor: 'rgba(255,255,255,0.12)',
	},
});
