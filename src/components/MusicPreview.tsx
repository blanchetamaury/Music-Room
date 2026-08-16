import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
	Easing,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withSequence,
	withTiming,
} from 'react-native-reanimated';
import { ThemedText } from './themed-text';

export function MusicPreview({
  color = '#ddd',
  title,
  artist,
  animationConfig,
}: {
  color?: string;
  title: string;
  artist: string;
  animationConfig?: {
    startX: number;
    startY: number;
    endY: number;
    drift: number;
    duration: number;
    delay: number;
  };
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!animationConfig) return;
    const cfg = animationConfig;

    // progress goes 0 -> 1 over duration, then resets to 0, repeating
    progress.value = withDelay(
      cfg.delay,
      withRepeat(
        withSequence(withTiming(1, { duration: cfg.duration, easing: Easing.linear }), withTiming(0, { duration: 0 })),
        -1,
        false
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationConfig]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!animationConfig) return {} as any;
    const cfg = animationConfig;
    const translateY = interpolate(progress.value, [0, 1], [cfg.startY, cfg.endY]);
    const translateX = cfg.startX + cfg.drift * progress.value;
    // ensure explicit endpoints for smooth fade-in and fade-out
    const opacity = interpolate(progress.value, [0, 0.12, 0.88, 1], [0, 1, 1, 0]);
    return {
      transform: [{ translateX }, { translateY }],
      opacity,
    } as any;
  });

  const Container: any = animationConfig ? Animated.View : View;

  return (
    <Container style={[styles.container, animationConfig ? styles.animatedContainer : null, animatedStyle]} pointerEvents="none">
      <View style={[styles.cover, { backgroundColor: color }]} />
      <View style={styles.meta}>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        <ThemedText type="default" style={styles.artist}>
          {artist}
        </ThemedText>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 220,
    height: 70,
    borderRadius: 14,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
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
