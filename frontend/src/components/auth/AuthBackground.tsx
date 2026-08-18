import React, { memo, useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { api } from '../../lib/api/client';
import DotGrid from './DotGrid';
import { MusicPreview } from './MusicPreview';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

function rnd(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

type DeezerTrack = {
  id: string | number
  title: string
  title_short?: string
  duration: string | number
  isrc?: string
  explicit_lyrics?: boolean
  preview?: string
  release_date?: string
  rank?: string | number
  track_position?: number
  disk_number?: number
  artist: { id: string | number; name: string; picture_medium?: string }
  album: {
    id: string | number
    title: string
    cover_medium?: string
    cover_big?: string
  }
}

type AnimationConfig = {
  startX: number
  startY: number
  endY: number
  drift: number
  duration: number
  delay: number
  color: string
}

const DENSITY = SCREEN_W / 40;
const FALLBACK_COLORS = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6A4C93', '#1A936F'];

function makeAnimationConfig(): AnimationConfig {
  return {
    startX: rnd(0, SCREEN_W * 0.9),
    startY: SCREEN_H + rnd(10, 20),
    endY: -200,
    drift: rnd(-180, 180),
    duration: Math.floor(rnd(7000, 16000)),
    delay: Math.floor(rnd(0, 6000)),
    color: FALLBACK_COLORS[Math.floor(Math.random() * FALLBACK_COLORS.length)],
  };
}

const AuthBackground = memo(function AuthBackground() {
  const [tracks, setTracks] = useState<DeezerTrack[]>([]);
  const [ready, setReady] = useState(false); // <-- nouveau
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const fetchTracks = async () => {
      try {
        const value = await api.deezer.chart();
        if (!value?.data) return;

        // Si ta route renvoie encore { data: [...] } imbriqué, déballe ici :
        const list = Array.isArray(value.data) ? value.data : (value.data as any).data;

        if (isMounted.current && Array.isArray(list) && list.length > 0) {
          setTracks(list);
          setReady(true); // <-- signale que c'est prêt
        }
      } catch (err) {
        console.error('[AuthBackground] failed to fetch tracks', err);
      }
    };

    fetchTracks();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const configsRef = useRef<AnimationConfig[]>(
    Array.from({ length: DENSITY }).map(makeAnimationConfig)
  );

  if (!ready || tracks.length === 0) return null; // <-- attend explicitement "ready"

  return (
    <View style={styles.fullOverlay} pointerEvents="none">
		<DotGrid
      minSize={1}
      maxSize={3}
      spacing={24}
      colors={[
        '#FF6B6B',
        '#4ECDC4',
        '#6A4C93',
      ]}
      pulseDuration={3000}
      pulseIntensity={0.8}
    />
      {configsRef.current.map((animCfg, i) => {
        const track = tracks[i % tracks.length];
        if (!track) return null;

        return (
          <MusicPreview
            key={`anim-${track.id}-${i}`}
            color={animCfg.color}
            title={track.title}
            artist={track.artist?.name ?? 'Unknown'}
            cover={track.album?.cover_medium}
            animationConfig={animCfg}
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