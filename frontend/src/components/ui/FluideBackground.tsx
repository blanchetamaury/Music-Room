import {
	ExpoWebGLRenderingContext,
	GLView,
} from 'expo-gl';
import {
	useEffect,
	useRef,
} from 'react';
import {
	StyleSheet
} from 'react-native';

import fluidFragmentShader from './shader/fluid.frag';
import fluidVertexShader from './shader/fluid.vert';

type Color = [
	number,
	number,
	number,
	number,
];

export interface FluidColors {
	colour1: Color;
	colour2: Color;
	colour3: Color;
}

interface FluidBackgroundProps {
	colors?: FluidColors;
}

interface Resolution {
	width: number;
	height: number;
}

function compileShader(
	gl: ExpoWebGLRenderingContext,
	type: number,
	source: string,
): WebGLShader {
	const shader = gl.createShader(type);

	if (!shader) {
		throw new Error('Unable to create shader');
	}

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const error = gl.getShaderInfoLog(shader);

		gl.deleteShader(shader);

		throw new Error(
			`Shader compilation failed:\n${error}`,
		);
	}

	return shader;
}

function createProgram(
	gl: ExpoWebGLRenderingContext,
	vertexSource: string,
	fragmentSource: string,
): WebGLProgram {
	const vertexShaderObject = compileShader(
		gl,
		gl.VERTEX_SHADER,
		vertexSource,
	);

	const fragmentShaderObject = compileShader(
		gl,
		gl.FRAGMENT_SHADER,
		fragmentSource,
	);

	const program = gl.createProgram();

	if (!program) {
		throw new Error(
			'Unable to create WebGL program',
		);
	}

	gl.attachShader(
		program,
		vertexShaderObject,
	);

	gl.attachShader(
		program,
		fragmentShaderObject,
	);

	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const error = gl.getProgramInfoLog(program);

		gl.deleteProgram(program);
		gl.deleteShader(vertexShaderObject);
		gl.deleteShader(fragmentShaderObject);

		throw new Error(
			`Program linking failed:\n${error}`,
		);
	}

	gl.deleteShader(vertexShaderObject);
	gl.deleteShader(fragmentShaderObject);

	return program;
}

const defaultColors: FluidColors = {
	colour1: [0.05, 0.10, 0.30, 1.0],
	colour2: [0.10, 0.40, 1.00, 1.0],
	colour3: [0.80, 0.20, 0.80, 1.0],
};

function lerp(
	current: number,
	target: number,
	speed: number,
): number {
	return current + (target - current) * speed;
}

function lerpColor(
	current: Color,
	target: Color,
	speed: number,
): Color {
	return [
		lerp(current[0], target[0], speed),
		lerp(current[1], target[1], speed),
		lerp(current[2], target[2], speed),
		lerp(current[3], target[3], speed),
	];
}

function onContextCreate(
	gl: ExpoWebGLRenderingContext,
	colorsRef: React.MutableRefObject<FluidColors>,
	currentColorsRef: React.MutableRefObject<FluidColors>,
	resolutionRef: React.MutableRefObject<Resolution>,
) {
	const program = createProgram(
		gl,
		fluidVertexShader,
		fluidFragmentShader,
	);

	gl.useProgram(program);

	/*
	 * ------------------------------------------------------------
	 * Fullscreen quad
	 * ------------------------------------------------------------
	 */

	const vertices = new Float32Array([
		-1, -1,
		 1, -1,
		-1,  1,

		-1,  1,
		 1, -1,
		 1,  1,
	]);

	const buffer = gl.createBuffer();

	if (!buffer) {
		throw new Error(
			'Unable to create vertex buffer',
		);
	}

	gl.bindBuffer(
		gl.ARRAY_BUFFER,
		buffer,
	);

	gl.bufferData(
		gl.ARRAY_BUFFER,
		vertices,
		gl.STATIC_DRAW,
	);

	const position = gl.getAttribLocation(
		program,
		'a_position',
	);

	if (position === -1) {
		throw new Error(
			'a_position not found in vertex shader',
		);
	}

	gl.enableVertexAttribArray(position);

	gl.vertexAttribPointer(
		position,
		2,
		gl.FLOAT,
		false,
		0,
		0,
	);

	/*
	 * ------------------------------------------------------------
	 * Uniforms
	 * ------------------------------------------------------------
	 */

	const resolution = gl.getUniformLocation(
		program,
		'u_resolution',
	);

	const time = gl.getUniformLocation(
		program,
		'u_time',
	);

	const spinRotationSpeed =
		gl.getUniformLocation(
			program,
			'u_spinRotationSpeed',
		);

	const moveSpeed =
		gl.getUniformLocation(
			program,
			'u_moveSpeed',
		);

	const colour1 =
		gl.getUniformLocation(
			program,
			'u_colour1',
		);

	const colour2 =
		gl.getUniformLocation(
			program,
			'u_colour2',
		);

	const colour3 =
		gl.getUniformLocation(
			program,
			'u_colour3',
		);

	const contrast =
		gl.getUniformLocation(
			program,
			'u_contrast',
		);

	const lighting =
		gl.getUniformLocation(
			program,
			'u_lighting',
		);

	const spinAmount =
		gl.getUniformLocation(
			program,
			'u_spinAmount',
		);

	const pixelFilter =
		gl.getUniformLocation(
			program,
			'u_pixelFilter',
		);

	/*
	 * ------------------------------------------------------------
	 * Initial viewport
	 * ------------------------------------------------------------
	 */

	const updateResolution = () => {
		const width =
			gl.drawingBufferWidth;

		const height =
			gl.drawingBufferHeight;

		if (
			width <= 0 ||
			height <= 0
		) {
			return;
		}

		gl.viewport(
			0,
			0,
			width,
			height,
		);

		gl.uniform2f(
			resolution,
			width,
			height,
		);

		resolutionRef.current = {
			width,
			height,
		};
	};

	updateResolution();

	/*
	 * ------------------------------------------------------------
	 * Static uniforms
	 * ------------------------------------------------------------
	 */

	gl.uniform1f(
		spinRotationSpeed,
		1.0,
	);

	gl.uniform1f(
		moveSpeed,
		0.5,
	);

	gl.uniform1f(
		contrast,
		1.0,
	);

	gl.uniform1f(
		lighting,
		0.5,
	);

	gl.uniform1f(
		spinAmount,
		0.5,
	);

	gl.uniform1f(
		pixelFilter,
		500.0,
	);

	/*
	 * ------------------------------------------------------------
	 * Animation
	 * ------------------------------------------------------------
	 */

	const startTime = Date.now();

	const render = () => {
		const elapsed =
			(Date.now() - startTime) / 1000;

		/*
		 * --------------------------------------------------------
		 * Resolution
		 * --------------------------------------------------------
		 *
		 * drawingBufferWidth / drawingBufferHeight peuvent changer
		 * lorsque le GLView est redimensionné.
		 * --------------------------------------------------------
		 */

		const width =
			gl.drawingBufferWidth;

		const height =
			gl.drawingBufferHeight;

		if (
			width > 0 &&
			height > 0 &&
			(
				width !== resolutionRef.current.width ||
				height !== resolutionRef.current.height
			)
		) {
			gl.viewport(
				0,
				0,
				width,
				height,
			);

			gl.uniform2f(
				resolution,
				width,
				height,
			);

			resolutionRef.current = {
				width,
				height,
			};
		}

		/*
		 * --------------------------------------------------------
		 * Time
		 * --------------------------------------------------------
		 */

		gl.uniform1f(
			time,
			elapsed,
		);

		/*
		 * --------------------------------------------------------
		 * Smooth colors
		 * --------------------------------------------------------
		 */

		currentColorsRef.current.colour1 =
			lerpColor(
				currentColorsRef.current.colour1,
				colorsRef.current.colour1,
				0.05,
			);

		currentColorsRef.current.colour2 =
			lerpColor(
				currentColorsRef.current.colour2,
				colorsRef.current.colour2,
				0.05,
			);

		currentColorsRef.current.colour3 =
			lerpColor(
				currentColorsRef.current.colour3,
				colorsRef.current.colour3,
				0.05,
			);

		const c1 =
			currentColorsRef.current.colour1;

		const c2 =
			currentColorsRef.current.colour2;

		const c3 =
			currentColorsRef.current.colour3;

		/*
		 * --------------------------------------------------------
		 * Colors → GPU
		 * --------------------------------------------------------
		 */

		gl.uniform4f(
			colour1,
			c1[0],
			c1[1],
			c1[2],
			c1[3],
		);

		gl.uniform4f(
			colour2,
			c2[0],
			c2[1],
			c2[2],
			c2[3],
		);

		gl.uniform4f(
			colour3,
			c3[0],
			c3[1],
			c3[2],
			c3[3],
		);

		/*
		 * --------------------------------------------------------
		 * Render
		 * --------------------------------------------------------
		 */

		gl.drawArrays(
			gl.TRIANGLES,
			0,
			6,
		);

		gl.flush();
		gl.endFrameEXP();

		requestAnimationFrame(render);
	};

	render();
}

export default function FluidBackground({
	colors = defaultColors,
}: FluidBackgroundProps) {
	const colorsRef =
		useRef<FluidColors>(colors);

	const currentColorsRef =
		useRef<FluidColors>(colors);

	const resolutionRef =
		useRef<Resolution>({
			width: 0,
			height: 0,
		});

	useEffect(() => {
		colorsRef.current = colors;
	}, [colors]);

	return (
		<GLView
			style={StyleSheet.absoluteFill}
			onContextCreate={(gl) =>
				onContextCreate(
					gl,
					colorsRef,
					currentColorsRef,
					resolutionRef,
				)
			}
		/>
	);
}