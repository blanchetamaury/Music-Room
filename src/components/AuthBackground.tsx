import React, { memo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { MusicPreview } from './MusicPreview';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const sample = [
  { color: '#ff7f50', title: 'React Beats', artist: 'Expo DJ' },
  { color: '#7ec8e3', title: 'Sunset Loop', artist: 'Wave Maker' },
  { color: '#9b59b6', title: 'Night Drive', artist: 'Synth Labs' },
];

function rnd(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const DENSITY = 20;
const animatedConfigs = Array.from({ length: DENSITY }).map(() => ({
  startX: rnd(0, SCREEN_W * 0.9),
  startY: SCREEN_H + rnd(10, 20),
  endY: -200,
  drift: rnd(-180, 180),
  duration: Math.floor(rnd(7000, 16000)),
  delay: Math.floor(rnd(0, 6000)),
  color: sample[Math.floor(Math.random() * sample.length)].color,
  title: sample[Math.floor(Math.random() * sample.length)].title,
  artist: sample[Math.floor(Math.random() * sample.length)].artist,
}));

const AuthBackground = memo(function AuthBackground() {
  return (
    <View style={styles.fullOverlay} pointerEvents="none">
      {animatedConfigs.map((cfg, i) => (
        <MusicPreview
          key={`anim-${i}`}
          color={cfg.color}
          title={cfg.title}
          artist={cfg.artist}
          animationConfig={cfg}
        />
      ))}
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