import { useState } from 'react';
import { Platform, StyleSheet, TextInput, useColorScheme, View } from 'react-native';
import { ThemedText } from './themed-text';

type InputFormProps = {
	placeholder: string;
	inputValue: string;
	setInputValue: React.Dispatch<React.SetStateAction<string>>;
	setError: React.Dispatch<React.SetStateAction<string | null>>;
};

export function InputForm(props: InputFormProps) {
	const colorScheme = useColorScheme();
	const [touchedEmail, setTouchedEmail] = useState(false);
	const [emailFocused, setEmailFocused] = useState(false);
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const isEmailValid = emailRegex.test(props.inputValue);

	return (
		<>
			<View
				style={[
					styles.inputWrapper,
					touchedEmail && !isEmailValid && !emailFocused ? styles.inputInvalid : null,
					{
						maxWidth: Platform.OS === 'android' ? 200 : 'auto',
						minWidth: Platform.OS === 'android' ? 200 : 'auto',
					},
				]}
			>
				<TextInput
					placeholder={props.placeholder}
					placeholderTextColor={colorScheme === 'light' ? '#48494b' : '#D1D5D8'}
					value={props.inputValue}
					onChangeText={(text) => {
						props.setInputValue(text);
						props.setError(null);
					}}
					onFocus={() => setEmailFocused(true)}
					onBlur={() => {
						setEmailFocused(false);
						setTouchedEmail(true);
					}}
					keyboardType="email-address"
					autoCapitalize="none"
					underlineColorAndroid="transparent"
					style={[
						styles.input,
						{ color: `${colorScheme === 'light' ? '#000000' : '#ffffff'}` },
						Platform.OS === 'web'
							? ({
									outlineWidth: 0,
									outlineColor: 'transparent',
									outlineStyle: 'none',
								} as any)
							: null,
					]}
					accessibilityLabel="email"
				/>
			</View>
			{touchedEmail && !isEmailValid && !emailFocused && (
				<ThemedText style={styles.error}>Invalid email address</ThemedText>
			)}
		</>
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
	inputInvalid: {
		borderColor: '#ff6b6b',
	},
	error: {
		marginTop: 6,
		marginBottom: 8,
		color: '#ff6b6b',
		textAlign: 'center',
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
