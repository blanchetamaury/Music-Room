import Svg, { Path } from 'react-native-svg';
import { si42 } from 'simple-icons';

type FTIconProps = {
  size?: number;
  color?: string;
};

export function FTIcon({
  size = 20,
  color = '#ffffff',
}: FTIconProps) {
  return (
	<Svg
	  width={size}
	  height={size}
	  viewBox="0 0 24 24"
	  fill="none"
	>
	  <Path
		d={si42.path}
		fill={color}
	  />
	</Svg>
  );
}