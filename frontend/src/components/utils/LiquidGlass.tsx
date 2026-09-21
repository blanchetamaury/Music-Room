import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleProp, StyleSheet, useColorScheme, View, ViewStyle } from 'react-native';

type Tint = 'light' | 'dark' | 'default';

type Props = {
	children?: React.ReactNode;

	style?: StyleProp<ViewStyle>;
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

	shimmer?: boolean;
	chromatic?: boolean;

	borderWidth?: number;
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

	shimmer = false,
	chromatic = true,

	borderWidth,
	borderColor,
}: Props) {
	const colorScheme = useColorScheme();
	const isLight = colorScheme === 'light';

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
		<View style={[styles.clip, style, outerRadius]}>
			<BlurView
				intensity={intensity}
				tint={tint}
				experimentalBlurMethod="dimezisBlurView"
				style={StyleSheet.absoluteFill}
				pointerEvents="none"
			/>

			<LinearGradient
				colors={
					isLight
						? ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.025)', 'rgba(255,255,255,0.07)']
						: ['rgba(255,255,255,0.055)', 'rgba(255,255,255,0.01)', 'rgba(255,255,255,0.035)']
				}
				locations={[0, 0.55, 1]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={StyleSheet.absoluteFill}
				pointerEvents="none"
			/>

			<LinearGradient
				colors={['transparent', isLight ? 'rgba(0,0,0,0.045)' : 'rgba(0,0,0,0.10)']}
				locations={[0.65, 1]}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
				style={StyleSheet.absoluteFill}
				pointerEvents="none"
			/>

			{chromatic && (
				<>
					<LinearGradient
						colors={['rgba(255,80,160,0.07)', 'transparent']}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 0 }}
						style={styles.edgeLeft}
						pointerEvents="none"
					/>

					<LinearGradient
						colors={['transparent', 'rgba(90,170,255,0.07)']}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 0 }}
						style={styles.edgeRight}
						pointerEvents="none"
					/>
				</>
			)}

			<LinearGradient
				colors={['transparent', isLight ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.18)', 'transparent']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 0 }}
				style={styles.topEdge}
				pointerEvents="none"
			/>

			<View
				style={[
					styles.border,
					outerRadius,
					{
						borderColor: borderColor ?? (isLight ? 'rgba(255,255,255,0.50)' : 'rgba(255,255,255,0.20)'),
						borderWidth: borderWidth ?? StyleSheet.hairlineWidth * 1.5,
					},
				]}
				pointerEvents="none"
			/>

			<View style={[styles.content, contentRadius, contentStyle]}>{children}</View>
		</View>
	);
}

const styles = StyleSheet.create({
	clip: {
		overflow: 'hidden',
		backgroundColor: 'transparent',
		minWidth: 0,

		...Platform.select({
			ios: {
				shadowColor: '#000',
				shadowOffset: {
					width: 0,
					height: 8,
				},
				shadowOpacity: 0.18,
				shadowRadius: 20,
			},
			android: {
				elevation: 0,
			},
			default: {},
		}),
	},

	content: {
		padding: 20,
		width: '100%',
		minWidth: 0,
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
	},
});
