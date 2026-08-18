import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

type DotGridProps = {
  minSize?: number;
  maxSize?: number;
  spacing?: number;
  colors?: string[];
  pulseDuration?: number;
  pulseIntensity?: number;
};

type Color = {
  r: number;
  g: number;
  b: number;
};

function hexToRgb(hex: string): Color {
  const clean = hex.replace('#', '');

  const value =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;

  return {
    r: parseInt(value.slice(0, 2), 16) / 255,
    g: parseInt(value.slice(2, 4), 16) / 255,
    b: parseInt(value.slice(4, 6), 16) / 255,
  };
}

function createShader(
  gl: ExpoWebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error('Failed to create shader');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader);

    gl.deleteShader(shader);

    throw new Error(`Shader compilation failed: ${error}`);
  }

  return shader;
}

function createProgram(
  gl: ExpoWebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string,
) {
  const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexSource,
  );

  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentSource,
  );

  const program = gl.createProgram();

  if (!program) {
    throw new Error('Failed to create WebGL program');
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error = gl.getProgramInfoLog(program);

    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    throw new Error(`Program linking failed: ${error}`);
  }

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
}

const DotGrid = memo(function DotGrid({
  minSize = 1.5,
  maxSize = 3,
  spacing = 24,
  colors = [
    '#6C63FF',
    '#00C2FF',
    '#FF4ECD',
  ],
  pulseDuration = 3000,
  pulseIntensity = 1,
}: DotGridProps) {
  const animationRef = useRef<number | null>(null);

  const onContextCreate = useCallback(
    async (gl: ExpoWebGLRenderingContext) => {
      /*
       * IMPORTANT :
       * La précision est explicitement définie
       * dans les DEUX shaders.
       */
      const vertexShader = `
        precision highp float;

        attribute vec2 a_position;
        attribute float a_phase;

        uniform vec2 u_resolution;
        uniform float u_time;
        uniform float u_minSize;
        uniform float u_maxSize;
        uniform float u_pulseDuration;
        uniform float u_pulseIntensity;

        varying float v_intensity;
        varying vec2 v_position;

        void main() {
          float t = mod(
            u_time / u_pulseDuration + a_phase,
            1.0
          );

          float pulse =
            (sin(t * 6.28318530718) + 1.0) * 0.5;

          pulse = smoothstep(
            0.0,
            1.0,
            pulse
          );

          pulse *= u_pulseIntensity;

          float size = mix(
            u_minSize,
            u_maxSize,
            pulse
          );

          vec2 zeroToOne =
            a_position / u_resolution;

          vec2 clipSpace =
            zeroToOne * 2.0 - 1.0;

          clipSpace.y *= -1.0;

          gl_Position = vec4(
            clipSpace,
            0.0,
            1.0
          );

          gl_PointSize = size;

          v_intensity = pulse;
          v_position = a_position;
        }
      `;

      const fragmentShader = `
        precision highp float;

        uniform vec2 u_resolution;

        uniform vec3 u_color1;
        uniform vec3 u_color2;
        uniform vec3 u_color3;

        varying float v_intensity;
        varying vec2 v_position;

        void main() {
          vec2 coord =
            gl_PointCoord - vec2(0.5);

          float distance =
            length(coord);

          if (distance > 0.5) {
            discard;
          }

          /*
           * Position normalisée.
           *
           * On utilise u_resolution ici uniquement
           * pour calculer le dégradé.
           */
          vec2 normalized =
            v_position / u_resolution;

          float gradient =
            clamp(
              (normalized.x + normalized.y) * 0.5,
              0.0,
              1.0
            );

          vec3 color;

          if (gradient < 0.5) {
            color = mix(
              u_color1,
              u_color2,
              gradient * 2.0
            );
          } else {
            color = mix(
              u_color2,
              u_color3,
              (gradient - 0.5) * 2.0
            );
          }

          float alpha = mix(
            0.25,
            0.9,
            v_intensity
          );

          gl_FragColor = vec4(
            color,
            alpha
          );
        }
      `;

      const program = createProgram(
        gl,
        vertexShader,
        fragmentShader,
      );

      gl.useProgram(program);

      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;

      const columns =
        Math.ceil(width / spacing) + 1;

      const rows =
        Math.ceil(height / spacing) + 1;

      const vertices: number[] = [];

      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const x = column * spacing;
          const y = row * spacing;

          const phase =
            ((row * 37 + column * 73) % 100) / 100;

          vertices.push(
            x,
            y,
            phase,
          );
        }
      }

      const buffer = gl.createBuffer();

      if (!buffer) {
        throw new Error(
          'Failed to create vertex buffer',
        );
      }

      gl.bindBuffer(
        gl.ARRAY_BUFFER,
        buffer,
      );

      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW,
      );

      /*
       * Attributes
       */

      const positionLocation =
        gl.getAttribLocation(
          program,
          'a_position',
        );

      const phaseLocation =
        gl.getAttribLocation(
          program,
          'a_phase',
        );

      const stride =
        3 * Float32Array.BYTES_PER_ELEMENT;

      gl.enableVertexAttribArray(
        positionLocation,
      );

      gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        stride,
        0,
      );

      gl.enableVertexAttribArray(
        phaseLocation,
      );

      gl.vertexAttribPointer(
        phaseLocation,
        1,
        gl.FLOAT,
        false,
        stride,
        2 * Float32Array.BYTES_PER_ELEMENT,
      );

      /*
       * Uniforms
       */

      const resolutionLocation =
        gl.getUniformLocation(
          program,
          'u_resolution',
        );

      const timeLocation =
        gl.getUniformLocation(
          program,
          'u_time',
        );

      const minSizeLocation =
        gl.getUniformLocation(
          program,
          'u_minSize',
        );

      const maxSizeLocation =
        gl.getUniformLocation(
          program,
          'u_maxSize',
        );

      const durationLocation =
        gl.getUniformLocation(
          program,
          'u_pulseDuration',
        );

      const intensityLocation =
        gl.getUniformLocation(
          program,
          'u_pulseIntensity',
        );

      const color1Location =
        gl.getUniformLocation(
          program,
          'u_color1',
        );

      const color2Location =
        gl.getUniformLocation(
          program,
          'u_color2',
        );

      const color3Location =
        gl.getUniformLocation(
          program,
          'u_color3',
        );

      const color1 = hexToRgb(
        colors[0] ?? '#FFFFFF',
      );

      const color2 = hexToRgb(
        colors[1] ??
          colors[0] ??
          '#FFFFFF',
      );

      const color3 = hexToRgb(
        colors[2] ??
          colors[1] ??
          colors[0] ??
          '#FFFFFF',
      );

      /*
       * Configuration
       */

      gl.uniform2f(
        resolutionLocation,
        width,
        height,
      );

      gl.uniform1f(
        minSizeLocation,
        minSize,
      );

      gl.uniform1f(
        maxSizeLocation,
        maxSize,
      );

      gl.uniform1f(
        durationLocation,
        pulseDuration,
      );

      gl.uniform1f(
        intensityLocation,
        pulseIntensity,
      );

      gl.uniform3f(
        color1Location,
        color1.r,
        color1.g,
        color1.b,
      );

      gl.uniform3f(
        color2Location,
        color2.r,
        color2.g,
        color2.b,
      );

      gl.uniform3f(
        color3Location,
        color3.r,
        color3.g,
        color3.b,
      );

      gl.viewport(
        0,
        0,
        width,
        height,
      );

      /*
       * Animation
       */

      const startTime = Date.now();

      const render = () => {
        const elapsed =
          Date.now() - startTime;

        gl.clearColor(
          0,
          0,
          0,
          0,
        );

        gl.clear(
          gl.COLOR_BUFFER_BIT,
        );

        gl.uniform1f(
          timeLocation,
          elapsed,
        );

        gl.drawArrays(
          gl.POINTS,
          0,
          vertices.length / 3,
        );

        gl.endFrameEXP();

        animationRef.current =
          requestAnimationFrame(render);
      };

      render();
    },
    [
      spacing,
      minSize,
      maxSize,
      colors,
      pulseDuration,
      pulseIntensity,
    ],
  );

  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(
          animationRef.current,
        );
      }
    };
  }, []);

  return (
    <View
      pointerEvents="none"
      style={styles.container}
    >
      <GLView
        style={StyleSheet.absoluteFill}
        onContextCreate={onContextCreate}
      />
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