import { useThemeColor } from '@/src/hooks/use-theme-color';
import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
	Easing,
	interpolate,
	runOnJS,
	useAnimatedReaction,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withSequence,
	withTiming,
} from 'react-native-reanimated';
import LiquidGlass from '../LiquidGlass';
import { ThemedText } from '../themed-text';
import { OutputTrackDeezer } from '@/src/types/deezer/OutputDeezerTrack';

export function MusicPreview({
	color = '#ddd',
	animationConfig,
	tracks = [],
}: {
	color?: string;
	cover?: string;
	title: string;
	artist: string;
	animationConfig: {
		startX: number;
		startY: number;
		endX: number;
		endY: number;
		drift: number;
		duration: number;
		delay: number;
	};
	tracks?: OutputTrackDeezer[];
}) {
	const glassBg = useThemeColor({ light: 'rgba(255, 255, 255, 0.72)', dark: 'rgba(18, 18, 18, 0.75)' }, 'background');
	const progress = useSharedValue(0);
	const [currentTrack, setCurrentTrack] = React.useState<OutputTrackDeezer | null>(null);

	useEffect(() => {
		if (!animationConfig) return;
		const cfg = animationConfig;

		progress.value = withDelay(
			cfg.delay,
			withRepeat(
				withSequence(
					withTiming(1, { duration: cfg.duration, easing: Easing.linear }),
					withTiming(0, { duration: 0 })
				),
				-1,
				false
			)
		);
	}, [animationConfig]);

	useAnimatedReaction(
		() => progress.value,
		(current, previous) => {
			if (previous != null && current === 0 && previous > 0.5 && tracks.length > 0) {
				const newIndex = Math.floor(Math.random() * tracks.length);
				runOnJS(setCurrentTrack)(tracks[newIndex]);
			}
		},
		[tracks.length]
	);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateX: animationConfig.startX + animationConfig.drift * progress.value },
			{ translateY: interpolate(progress.value, [0, 1], [animationConfig.endX, animationConfig.endY]) },
			{ scale: interpolate(progress.value, [0, 0.12, 0.88, 1], [0.8, 1, 1, 0.5]) },
		],
		opacity: interpolate(progress.value, [0, 0.12, 0.88, 1], [0, 1, 1, 0]),
		filter: [{ blur: interpolate(progress.value, [0, 0.12, 0.88, 1], [10, 0, 0, 10]) }],
	}));

	const OuterView = animationConfig ? Animated.View : View;

	return (
		<OuterView
			style={[styles.container, animationConfig ? styles.animatedContainer : null, animatedStyle]}
			pointerEvents="none"
		>
			{ currentTrack && 
				<LiquidGlass
					radius={16}
					topLeftRadius={16}
					topRightRadius={16}
					bottomLeftRadius={16}
					bottomRightRadius={16}
					intensity={40}
					tint="dark"
					shimmer={true}
					chromatic={true}
					style={[StyleSheet.absoluteFillObject, { backgroundColor: glassBg }]}
					contentStyle={styles.content}
				>
					{ currentTrack?.album.CoverMedium ? (
						<Image source={{ uri: currentTrack.album.CoverMedium }} style={styles.cover} resizeMode="cover" />
					) : (
						<View style={[styles.cover, { backgroundColor: color }]} />
					)}
					<View style={styles.meta}>
						<ThemedText type="defaultSemiBold" numberOfLines={1}>
							{currentTrack?.title}
						</ThemedText>
						<ThemedText type="default" style={styles.artist} numberOfLines={1}>
							{currentTrack?.artist[0].name ?? 'Unknown'}
						</ThemedText>
					</View>
				</LiquidGlass>
			}
		</OuterView>
	);
}

const styles = StyleSheet.create({
	container: {
		width: 220,
		height: 70,
		borderRadius: 14,
		marginRight: 12,
	},
	content: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		padding: 8,
	},
	cover: {
		width: 54,
		height: 54,
		borderRadius: 8,
		marginRight: 10,
	},
	meta: {
		flex: 1,
		justifyContent: 'center',
	},
	artist: {
		marginTop: 4,
		fontSize: 13,
		opacity: 0.9,
	},
	animatedContainer: {
		position: 'absolute',
		zIndex: 0,
	},
});
