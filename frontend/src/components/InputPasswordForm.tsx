import { ReactNode } from 'react';
import { Platform, StyleSheet, TextInput, useColorScheme, View } from 'react-native';

type InputFormProps = {
	placeholder: string;
	inputValue: string;
	showInputValue: boolean;
	setInputValue: React.Dispatch<React.SetStateAction<string>>;
	setError: React.Dispatch<React.SetStateAction<string | null>>;
	children?: ReactNode;
};

export function InputPasswordForm(props: InputFormProps) {
	const colorScheme = useColorScheme();

	return (
		<View style={[styles.inputWrapper, styles.inputDistinct]}>
			<TextInput
				placeholder={props.placeholder}
				placeholderTextColor={colorScheme === 'light' ? '#48494b' : '#D1D5D8'}
				value={props.inputValue}
				onChangeText={(text) => {
					props.setInputValue(text);
					props.setError(null);
				}}
				secureTextEntry={!props.showInputValue}
				underlineColorAndroid="transparent"
				style={[
					styles.input,
					{ paddingRight: 48, color: `${colorScheme === 'light' ? '#000000' : '#ffffff'}` },
					Platform.OS === 'web'
						? ({
								outlineWidth: 0,
								outlineColor: 'transparent',
								outlineStyle: 'none',
							} as any)
						: null,
				]}
				accessibilityLabel="password"
			/>
			{props.children}
		</View>
	);
}

const styles = StyleSheet.create({
	inputWrapper: {
		marginTop: 8,
		borderRadius: 12,
		borderWidth: 1,
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	inputDistinct: {
		backgroundColor: 'rgba(255,255,255,0.03)',
	},
	input: {
		height: 44,
	},
	glassOverlayInner: {
		position: 'absolute',
		inset: 0,
		backgroundColor: 'rgba(255,255,255,0.02)',
	},
	showBtn: {
		position: 'absolute',
		right: 12,
		top: 0,
		bottom: 0,
		justifyContent: 'center',
	},
	loginBtn: {
		marginTop: 18,
		paddingVertical: 12,
		borderRadius: 12,
		alignItems: 'center',
		backgroundColor: '#0a7ea4',
	},
	darkBtn: {
		paddingLeft: 10,
		paddingRight: 10,
		marginTop: 12,
		paddingVertical: 10,
		borderRadius: 12,
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.69)',
		flexDirection: 'row',
		gap: 10,
		justifyContent: 'center',
	},
	ligthBtn: {
		paddingLeft: 10,
		paddingRight: 10,
		marginTop: 12,
		paddingVertical: 10,
		borderRadius: 12,
		alignItems: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.69)',
		flexDirection: 'row',
		gap: 10,
		justifyContent: 'center',
	},
});
