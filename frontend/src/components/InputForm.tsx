import { useState } from 'react';
import {
	Platform,
	StyleSheet,
	TextInput,
	useColorScheme,
	View,
} from 'react-native';

import { ThemedText } from './themed-text';

type InputFormProps = {
	placeholder: string;
	inputValue: string;
	isEmail: boolean;
	setInputValue: React.Dispatch<
		React.SetStateAction<string>
	>;
	setError?: React.Dispatch<
		React.SetStateAction<string | null>
	>;
};

export function InputForm(props: InputFormProps) {
	const colorScheme = useColorScheme();

	const [touched, settouched] = useState(false);
	const [emailFocused, setEmailFocused] =
		useState(false);

	const emailRegex =
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	const isEmailValid = emailRegex.test(
		props.inputValue,
	);

	return (
		<>
			<View
				style={[
					styles.inputWrapper,
					props.isEmail &&
						touched &&
						!isEmailValid &&
						!emailFocused &&
						styles.inputInvalid,
				]}
			>
				<TextInput
					placeholder={props.placeholder}
					placeholderTextColor={
						colorScheme === 'light'
							? '#48494b'
							: '#D1D5D8'
					}
					value={props.inputValue}
					onChangeText={(text) => {
						props.setInputValue(text);

						if (props.setError) {
							props.setError(null);
						}
					}}
					onFocus={() =>
						setEmailFocused(true)
					}
					onBlur={() => {
						setEmailFocused(false);
						settouched(true);
					}}
					keyboardType={
						props.isEmail
							? 'email-address'
							: 'default'
					}
					autoCapitalize="none"
					underlineColorAndroid="transparent"
					style={[
						styles.input,
						{
							color:
								colorScheme === 'light'
									? '#000000'
									: '#ffffff',
						},
						Platform.OS === 'web'
							? ({
									outlineWidth: 0,
									outlineColor:
										'transparent',
									outlineStyle: 'none',
								} as any)
							: null,
					]}
					accessibilityLabel="email"
				/>
			</View>

			{touched &&
				!isEmailValid &&
				!emailFocused &&
				props.isEmail && (
					<ThemedText style={styles.error}>
						Invalid email address
					</ThemedText>
				)}
		</>
	);
}

const styles = StyleSheet.create({
	inputWrapper: {
		width: '100%',
		minWidth: 0,
		maxWidth: '100%',
		marginTop: 8,
		borderRadius: 12,
		borderWidth: 1,
		paddingHorizontal: 12,
		paddingVertical: 8,
	},

	input: {
		width: '100%',
		minWidth: 0,
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
});