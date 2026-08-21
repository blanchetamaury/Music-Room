import React, { memo, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type DotGridProps = {
	minSize?: number;
	maxSize?: number;
	spacing?: number;
	colors?: string[];
	opacity?: number;
};

type Dot = {
	id: string;
	x: number;
	y: number;
	colorIndex: number;
	size: number;
};

const MAX_DOTS = 350;

function getResponsiveSpacing(width: number, height: number, requestedSpacing?: number) {
	if (requestedSpacing) {
		return requestedSpacing;
	}

	const area = width * height;

	const spacing = Math.sqrt(area / MAX_DOTS);

	return Math.max(24, spacing);
}

const DotGrid = memo(function DotGrid({
	minSize = 1,
	maxSize = 3,
	spacing,
	colors = ['#FF6B6B', '#4ECDC4', '#6A4C93'],
	opacity = 0.5,
}: DotGridProps) {
	const { width, height } = useWindowDimensions();

	const actualSpacing = getResponsiveSpacing(width, height, spacing);

	/*
	 * Les dots ne sont recalculés que lorsque les
	 * dimensions ou la configuration changent.
	 *
	 * Aucun calcul par frame.
	 */
	const dots = useMemo<Dot[]>(() => {
		if (width <= 0 || height <= 0 || actualSpacing <= 0) {
			return [];
		}

		const columns = Math.ceil(width / actualSpacing) + 1;

		const rows = Math.ceil(height / actualSpacing) + 1;

		const result: Dot[] = [];

		for (let row = 0; row < rows; row++) {
			for (let column = 0; column < columns; column++) {
				const seed = (row * 37 + column * 73) % 100;

				const normalized = seed / 100;

				const size = minSize + (maxSize - minSize) * normalized;

				const colorIndex = (row * 17 + column * 31) % colors.length;

				result.push({
					id: `${row}-${column}`,
					x: column * actualSpacing,
					y: row * actualSpacing,
					colorIndex,
					size,
				});
			}
		}

		return result;
	}, [width, height, actualSpacing, minSize, maxSize, colors]);

	if (dots.length === 0) {
		return null;
	}

	return (
		<View pointerEvents="none" style={styles.container}>
			<Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
				{dots.map((dot) => (
					<Circle
						key={dot.id}
						cx={dot.x}
						cy={dot.y}
						r={dot.size}
						fill={colors[dot.colorIndex] ?? colors[0] ?? '#FFFFFF'}
						opacity={opacity}
					/>
				))}
			</Svg>
		</View>
	);
});

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFillObject,
		pointerEvents: 'none',
	},
});

export default DotGrid;
