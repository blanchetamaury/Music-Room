const fluidFragmentShader = `
precision mediump float;

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
    float resolutionLength = length(u_resolution);
    float invResolutionLength = 1.0 / resolutionLength;

    float pixelSize = resolutionLength / u_pixelFilter;

    vec2 uv = (
        floor(gl_FragCoord.xy / pixelSize)
        * pixelSize
        - 0.5 * u_resolution
    ) * invResolutionLength;

    float uvLen = length(uv);

    float speed =
        u_time * u_spinRotationSpeed * 0.2
        + 302.2;

    float angle =
        atan(uv.y, uv.x)
        + speed
        - 20.0 * (
            u_spinAmount * uvLen
            + 1.0 - u_spinAmount
        );

    float sinAngle = sin(angle);
    float cosAngle = cos(angle);

    uv = vec2(
        uvLen * cosAngle,
        uvLen * sinAngle
    );

    uv *= 30.0;

    float moveSpeed = u_time * u_moveSpeed;

    vec2 uv2 = vec2(
        uv.x + uv.y
    );

    for (int i = 0; i < 3; i++) {
        uv2 += sin(max(uv.x, uv.y)) + uv;

        float angle1 =
            5.1123314
            + 0.353 * uv2.y
            + moveSpeed * 0.131121;

        float angle2 =
            uv2.x
            - 0.113 * moveSpeed;

        uv += 0.5 * vec2(
            cos(angle1),
            sin(angle2)
        );

        float angle3 =
            uv.x * 0.711
            - uv.y;

        uv -= vec2(
            cos(uv.x + uv.y)
            - sin(angle3)
        );
    }

    float contrastMod =
        0.25 * u_contrast
        + 0.5 * u_spinAmount
        + 1.2;

    float paintRes =
        clamp(
            length(uv)
            * 0.035
            * contrastMod,
            0.0,
            2.0
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

    float contrastBase =
        0.3 / u_contrast;

    vec3 color =
        contrastBase * u_colour1.rgb
        +
        (1.0 - contrastBase)
        * (
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