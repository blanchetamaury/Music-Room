import Svg, { Path } from 'react-native-svg';
import { siGoogle } from 'simple-icons';

type GoogleIconProps = {
  size?: number;
  color?: string;
};

export function GoogleIcon({
  size = 20,
  color = '#ffffff',
}: GoogleIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Path
        d={siGoogle.path}
        fill={color}
      />
    </Svg>
  );
}