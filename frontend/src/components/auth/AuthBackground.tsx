import React, { memo, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { api } from '../../lib/api/client';
import DotGrid from './DotGrid';
import { MusicPreview } from './MusicPreview';

function rnd(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

type DeezerTrack = {
	id: string | number;
	title: string;

	artist: {
		id: string | number;
		name: string;
		picture_medium?: string;
	};

	album: {
		id: string | number;
		title: string;
		cover_medium?: string;
		cover_big?: string;
	};
};

type AnimationConfig = {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	drift: number;
	duration: number;
	delay: number;
	color: string;
};

const FALLBACK_COLORS = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6A4C93', '#1A936F'];

function getPreviewCount(width: number) {
	if (width < 500) {
		return 5;
	}

	if (width < 900) {
		return 8;
	}

	return 30;
}

function makeAnimationConfig(width: number, height: number): AnimationConfig {
	const startX = rnd(50, width - 120);
	const startY = rnd(50, height - 70);

	return {
		startX,

		startY,

		endX: startX + rnd(-50, 50),

		endY: startY + rnd(-50, 50),

		drift: rnd(-width * 0.2, width * 0.2),

		duration: Math.floor(rnd(5, 6) * 1000),

		delay: Math.floor(rnd(0, 6000)),

		color: FALLBACK_COLORS[Math.floor(Math.random() * FALLBACK_COLORS.length)],
	};
}

const AuthBackground = memo(function AuthBackground() {
	const { width, height } = useWindowDimensions();

	const [tracks, setTracks] = useState<DeezerTrack[]>([]);

	const [imagesReady, setImagesReady] = useState(false);

	const configsRef = useRef<AnimationConfig[]>([]);

	const count = getPreviewCount(width);

	const previousCountRef = useRef(0);

	useEffect(() => {
		if (previousCountRef.current === count) {
			return;
		}

		previousCountRef.current = count;

		configsRef.current = Array.from({ length: count }, () => makeAnimationConfig(width, height));
	}, [count, width, height]);

	useEffect(() => {
		let mounted = true;

		const fetchTracks = async () => {
			try {
				const value = await api.deezer.chart();

				if (!value?.data) {
					return;
				}

				const list = Array.isArray(value.data) ? value.data : (value.data as any).data;

				if (!mounted || !Array.isArray(list) || list.length === 0) {
					return;
				}

				const validTracks = list.filter((track: DeezerTrack) => typeof track.album?.cover_medium === 'string');

				setTracks(validTracks);
			} catch (error) {
				console.error('[AuthBackground] failed to fetch tracks', error);
			}
		};

		fetchTracks();

		return () => {
			mounted = false;
		};
	}, []);

	useEffect(() => {
		if (tracks.length === 0) {
			return;
		}

		let mounted = true;

		const preloadImages = async () => {
			try {
				const covers = [
					...new Set(
						tracks
							.map((track) => track.album?.cover_medium)
							.filter((url): url is string => typeof url === 'string' && url.length > 0)
					),
				];

				await Promise.all(covers.map((url) => import('react-native').then(({ Image }) => Image.prefetch(url))));

				if (mounted) {
					setImagesReady(true);
				}
			} catch (error) {
				console.warn('[AuthBackground] image preload failed', error);

				if (mounted) {
					setImagesReady(true);
				}
			}
		};

		preloadImages();

		return () => {
			mounted = false;
		};
	}, [tracks]);

	if (!imagesReady || tracks.length === 0) {
		return null;
	}

	return (
		<View style={styles.fullOverlay} pointerEvents="none">
			<DotGrid minSize={1} maxSize={2} colors={['#FF6B6B', '#4ECDC4', '#6A4C93']} opacity={0.35} />

			{configsRef.current.map((config, index) => {
				const track = tracks[index % tracks.length];

				return (
					<MusicPreview
						key={`anim-${index}`}
						color={config.color}
						title={track.title}
						artist={track.artist?.name ?? 'Unknown'}
						cover={track.album?.cover_medium}
						animationConfig={config}
						tracks={tracks}
					/>
				);
			})}
		</View>
	);
});

const styles = StyleSheet.create({
	fullOverlay: {
		...StyleSheet.absoluteFillObject,
		zIndex: 0,
		pointerEvents: 'none',
	},
});

export default AuthBackground;
