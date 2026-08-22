import { Asset } from 'expo-asset';
import { SvgUri } from 'react-native-svg';

type IconProps = {
	size?: number;
	color?: string;
};

const googleAsset = Asset.fromModule(require('../../assets/images/Google_Logo.svg'));

const fortyTwoAsset = Asset.fromModule(require('../../assets/images/42_Logo.svg'));

export function GoogleIcon({ size = 32 }: IconProps) {
	return <SvgUri width={size} height={size} uri={googleAsset.uri} />;
}

export function FortyTwoIcon({ size = 32, color = '#ffff' }: IconProps) {
	return <SvgUri width={size} height={size} uri={fortyTwoAsset.uri} fill={color} />;
}
