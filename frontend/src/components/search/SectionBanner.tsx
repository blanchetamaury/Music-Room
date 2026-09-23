import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
	FadeInDown,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from 'react-native-reanimated';
import { ThemedText } from '../utils/themed-text';

export const PALETTE = {
	bg: '#0A0A0C',
	surface: '#131316',
	surfaceHi: '#1B1B20',
	border: 'rgba(255,255,255,0.07)',
	accent: '#3ECFFF',
	accentDeep: '#1E6BFF',
	accentSoft: 'rgba(62,207,255,0.14)',
	magenta: '#B44DFF',
	text: '#FFFFFF',
	textDim: 'rgba(255,255,255,0.58)',
};

export function SectionBanner({
	isSearching,
	query,
	count,
	loading,
}: {
	isSearching: boolean;
	query: string;
	count: number;
	loading: boolean;
}) {
	const pulse = useSharedValue(0);

	useEffect(() => {
		pulse.value = loading
			? withRepeat(withTiming(1, { duration: 700 }), -1, true)
			: withTiming(0, { duration: 200 });
	}, [loading, pulse]);

	const barStyle = (offset: number) =>
		useAnimatedStyle(() => ({
			height: interpolate(Math.min(1, Math.max(0, pulse.value - offset * 0.15 + 0.15)), [0, 1], [6, 18]),
		}));

	const b1 = barStyle(0);
	const b2 = barStyle(1);
	const b3 = barStyle(2);

	return (
		<Animated.View
			key={isSearching ? `s-${query}` : 'trending'}
			entering={FadeInDown.duration(320).springify().damping(15)}
			style={extra.banner}
		>
			<LinearGradient
				colors={
					isSearching
						? ['rgba(180,77,255,0.20)', 'rgba(30,107,255,0.06)']
						: ['rgba(62,207,255,0.18)', 'rgba(30,107,255,0.05)']
				}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={StyleSheet.absoluteFill}
			/>

			<View style={extra.bannerLeft}>
				<View style={extra.eq}>
					<Animated.View style={[extra.eqBar, b1]} />
					<Animated.View style={[extra.eqBar, b2]} />
					<Animated.View style={[extra.eqBar, b3]} />
				</View>

				<View>
					<ThemedText style={extra.bannerTitle}>
						{isSearching ? `Results for « ${query} »` : 'Trends of the moment'}
					</ThemedText>
					<ThemedText style={extra.bannerSub}>
						{loading ? 'Loading…' : `${count} title${count > 1 ? 's' : ''}`}
					</ThemedText>
				</View>
			</View>

			<View style={[extra.pill, { backgroundColor: isSearching ? 'rgba(180,77,255,0.22)' : PALETTE.accentSoft }]}>
				<ThemedText style={[extra.pillText, { color: isSearching ? PALETTE.magenta : PALETTE.accent }]}>
					{isSearching ? 'SEARCH' : 'TOP 50'}
				</ThemedText>
			</View>
		</Animated.View>
	);
}

const extra = StyleSheet.create({
	aura: { position: 'absolute', width: 620, height: 620, borderRadius: 310 },
	auraTop: { top: -260, left: -180 },
	auraRight: { top: 120, right: -240 },
	auraFill: { flex: 1, borderRadius: 310 },

	panel: {
		flex: 1,
		backgroundColor: PALETTE.surface,
		borderRadius: 16,
		padding: 12,
		position: 'relative',
		alignSelf: 'stretch',
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: PALETTE.border,
	},
	panelSheen: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
	panelHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 12,
		paddingHorizontal: 2,
	},
	titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	panelTitle: { color: PALETTE.text, fontWeight: '700', letterSpacing: 0.2 },
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: PALETTE.accent,
		shadowColor: PALETTE.accent,
		shadowOpacity: 0.9,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 0 },
	},
	countChip: {
		paddingHorizontal: 9,
		paddingVertical: 3,
		borderRadius: 999,
		backgroundColor: PALETTE.accentSoft,
	},
	countChipText: { color: PALETTE.accent, fontSize: 11, fontWeight: '700' },
	emptyText: { color: PALETTE.textDim, fontStyle: 'italic', textAlign: 'center', paddingVertical: 24 },

	banner: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 12,
		paddingHorizontal: 14,
		borderRadius: 14,
		marginBottom: 12,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: PALETTE.border,
	},
	bannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
	eq: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 20 },
	eqBar: { width: 3, borderRadius: 2, backgroundColor: PALETTE.accent },
	bannerTitle: { color: PALETTE.text, fontSize: 15, fontWeight: '700' },
	bannerSub: { color: PALETTE.textDim, fontSize: 12, marginTop: 2 },
	pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
	pillText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },

	albumCard: { borderRadius: 14, borderWidth: 1, padding: 8 },
	coverWrap: { position: 'relative', borderRadius: 10, overflow: 'hidden' },
	cover: { borderRadius: 10, aspectRatio: 1, width: '100%' },
	coverFill: { flex: 1, borderRadius: 10 },
	coverShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '45%' },
	rankBadge: {
		position: 'absolute',
		top: 6,
		left: 6,
		minWidth: 22,
		height: 22,
		paddingHorizontal: 6,
		borderRadius: 11,
		backgroundColor: 'rgba(0,0,0,0.6)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	rankText: { color: PALETTE.text, fontSize: 11, fontWeight: '800' },
	albumTitle: { color: PALETTE.text, fontWeight: '600', marginTop: 8 },
	metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
	heartDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: PALETTE.magenta },
	metaText: { color: PALETTE.textDim, fontSize: 11 },
});
