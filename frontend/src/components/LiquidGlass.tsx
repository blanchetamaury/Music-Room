// components/LiquidGlass.tsx
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Easing, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

type Tint = 'light' | 'dark' | 'default';

type Props = {
	children?: React.ReactNode;
	/** Style de LAYOUT (margin, width, flex, position...) */
	style?: StyleProp<ViewStyle>;
	/** Style INTÉRIEUR (padding, alignItems...) */
	contentStyle?: StyleProp<ViewStyle>;
	radius?: number;
	topLeftRadius?: number;
	topRightRadius?: number;
	bottomLeftRadius?: number;
	bottomRightRadius?: number;
	contentTopLeftRadius?: number;
	contentTopRightRadius?: number;
	contentBottomLeftRadius?: number;
	contentBottomRightRadius?: number;
	intensity?: number;
	tint?: Tint;
	/** Reflet animé qui balaie la surface */
	shimmer?: boolean;
	/** Aberration chromatique sur les bords */
	chromatic?: boolean;
	/** Épaisseur de la bordure extérieure */
	borderWidth?: number;
	/** Couleur de la bordure extérieure */
	borderColor?: string;
};

export default function LiquidGlass({
	children,
	style,
	contentStyle,
	radius = 24,
	topLeftRadius,
	topRightRadius,
	bottomLeftRadius,
	bottomRightRadius,
	contentTopLeftRadius,
	contentTopRightRadius,
	contentBottomLeftRadius,
	contentBottomRightRadius,
	intensity = 40,
	tint = 'dark',
	shimmer = true,
	chromatic = true,
	borderWidth,
	borderColor,
}: Props) {
	const progress = useSharedValue(0);

	useEffect(() => {
		if (!shimmer) return;
		progress.value = withRepeat(withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.ease) }), -1, false);
	}, [shimmer]);

	const shimmerStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: '18deg' }, { translateX: interpolate(progress.value, [0, 1], [-320, 320]) }],
		opacity: interpolate(progress.value, [0, 0.15, 0.5, 0.85, 1], [0, 0.6, 0.9, 0.6, 0]),
	}));

	const isLight = tint === 'light';

	const outerRadius = {
		borderTopLeftRadius: topLeftRadius ?? radius,
		borderTopRightRadius: topRightRadius ?? radius,
		borderBottomLeftRadius: bottomLeftRadius ?? radius,
		borderBottomRightRadius: bottomRightRadius ?? radius,
	};

	const contentRadius = {
		borderTopLeftRadius: contentTopLeftRadius ?? topLeftRadius ?? radius,
		borderTopRightRadius: contentTopRightRadius ?? topRightRadius ?? radius,
		borderBottomLeftRadius: contentBottomLeftRadius ?? bottomLeftRadius ?? radius,
		borderBottomRightRadius: contentBottomRightRadius ?? bottomRightRadius ?? radius,
	};

	return (
		// 1. WRAPPER : porte l'ombre (applique la `style` passée pour layout)
		<View style={[styles.clip, style as any, outerRadius]}>
			{/* 3. LE FLOU */}
			<BlurView
				intensity={intensity}
				tint={tint}
				experimentalBlurMethod="dimezisBlurView" // Android (SDK 52+)
				style={StyleSheet.absoluteFill}
			/>

			{/* 4. TEINTE : dégradé diagonal, plus clair en haut à gauche */}
			<LinearGradient
				colors={
					isLight
						? ['rgba(255,255,255,0.40)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0.18)']
						: ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.03)', 'rgba(255,255,255,0.08)']
				}
				locations={[0, 0.55, 1]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={StyleSheet.absoluteFill}
				pointerEvents="none"
			/>

			{/* 5. PROFONDEUR : ombre interne en bas pour l'épaisseur du verre */}
			<LinearGradient
				colors={['transparent', 'rgba(0,0,0,0.18)']}
				locations={[0.6, 1]}
				style={StyleSheet.absoluteFill}
				pointerEvents="none"
			/>

			{/* 7. SHIMMER : bande de lumière animée
        {shimmer && (
          <Animated.View style={[styles.shimmerWrap, shimmerStyle]} pointerEvents="none">
            <LinearGradient
              colors={[
                'transparent',
                'rgba(255,255,255,0.10)',
                'rgba(255,255,255,0.35)',
                'rgba(255,255,255,0.10)',
                'transparent',
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )} */}

			{/* 8. ABERRATION CHROMATIQUE : le verre disperse la lumière */}
			{chromatic && (
				<>
					<LinearGradient
						colors={['rgba(255,80,160,0.16)', 'transparent']}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 0 }}
						style={styles.edgeLeft}
						pointerEvents="none"
					/>
					<LinearGradient
						colors={['transparent', 'rgba(90,170,255,0.16)']}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 0 }}
						style={styles.edgeRight}
						pointerEvents="none"
					/>
				</>
			)}

			{/* 9. BORD SUPÉRIEUR : la fine ligne blanche qui vend l'effet */}
			<LinearGradient
				colors={['transparent', 'rgba(255,255,255,0.30)', 'transparent']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 0 }}
				style={styles.topEdge}
				pointerEvents="none"
			/>

			{/* 10. BORDURE EXTÉRIEURE */}
			<View
				style={[
					styles.border,
					outerRadius,
					{
						borderColor: borderColor ?? (isLight ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.28)'),
						borderWidth: borderWidth ?? StyleSheet.hairlineWidth * 1.5,
					},
				]}
				pointerEvents="none"
			/>

			{/* 11. CONTENU */}
			<View style={[styles.content, contentRadius, contentStyle]}>{children}</View>
		</View>
	);
}

const styles = StyleSheet.create({
	shadow: {
		...Platform.select({
			ios: {
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 12 },
				shadowOpacity: 0.35,
				shadowRadius: 24,
			},
			android: { elevation: 12 },
		}),
	},
	clip: {
		overflow: 'hidden',
		backgroundColor: 'transparent',
	},
	specular: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '75%',
		height: '65%',
	},
	shimmerWrap: {
		position: 'absolute',
		top: -60,
		bottom: -60,
		left: 0,
		width: 110,
	},
	edgeLeft: {
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,
		width: 3,
	},
	edgeRight: {
		position: 'absolute',
		right: 0,
		top: 0,
		bottom: 0,
		width: 3,
	},
	topEdge: {
		position: 'absolute',
		top: 0,
		left: '18%',
		right: '18%',
		height: StyleSheet.hairlineWidth,
	},
	border: {
		...StyleSheet.absoluteFillObject,
		borderWidth: StyleSheet.hairlineWidth * 1.5,
	},
	content: {
		padding: 20,
	},
});
