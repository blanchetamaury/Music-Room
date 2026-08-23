const fluidFragmentShader = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

uniform float u_spinRotationSpeed;
uniform float u_moveSpeed;

uniform vec4 u_colour1;
uniform vec4 u_colour2;
uniform vec4 u_colour3;

uniform float u_contrast;
uniform float u_lighting;
uniform float u_spinAmount;
uniform float u_pixelFilter;

void main() {
    float pixelSize = length(u_resolution) / u_pixelFilter;

    vec2 uv =
        (
            floor(gl_FragCoord.xy * (1.0 / pixelSize))
            * pixelSize
            - 0.5 * u_resolution
        )
        / length(u_resolution);

    float uvLen = length(uv);

    float speed = u_spinRotationSpeed * 0.2;

    speed = u_time * speed;

    speed += 302.2;

    float newPixelAngle =
        atan(uv.y, uv.x)
        + speed
        - 20.0 * (
            u_spinAmount * uvLen
            + (1.0 - u_spinAmount)
        );

    vec2 mid =
        (u_resolution / length(u_resolution)) / 2.0;

    uv = vec2(
        uvLen * cos(newPixelAngle) + mid.x,
        uvLen * sin(newPixelAngle) + mid.y
    ) - mid;

    uv *= 30.0;

    speed = u_time * u_moveSpeed;

    vec2 uv2 = vec2(uv.x + uv.y);

    for (int i = 0; i < 5; i++) {
        uv2 += sin(max(uv.x, uv.y)) + uv;

        uv += 0.5 * vec2(
            cos(
                5.1123314
                + 0.353 * uv2.y
                + speed * 0.131121
            ),
            sin(
                uv2.x
                - 0.113 * speed
            )
        );

        uv -=
            1.0 * cos(uv.x + uv.y)
            - 1.0 * sin(
                uv.x * 0.711
                - uv.y
            );
    }

    float contrastMod =
        0.25 * u_contrast
        + 0.5 * u_spinAmount
        + 1.2;

    float paintRes =
        min(
            2.0,
            max(
                0.0,
                length(uv)
                * 0.035
                * contrastMod
            )
        );

    float c1p =
        max(
            0.0,
            1.0 - contrastMod * abs(1.0 - paintRes)
        );

    float c2p =
        max(
            0.0,
            1.0 - contrastMod * abs(paintRes)
        );

    float c3p =
        1.0 - min(
            1.0,
            c1p + c2p
        );

    vec3 color =
        (0.3 / u_contrast) * u_colour1.rgb
        +
        (1.0 - 0.3 / u_contrast)
        *
        (
            u_colour1.rgb * c1p
            + u_colour2.rgb * c2p
            + u_colour3.rgb * c3p
        );

    float light =
        (u_lighting - 0.2)
        * max(c1p * 5.0 - 4.0, 0.0)
        +
        u_lighting
        * max(c2p * 5.0 - 4.0, 0.0);

    color += light;

    gl_FragColor = vec4(color, 1.0);
}
`;

export default fluidFragmentShader;