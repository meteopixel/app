import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { Fonts } from '@/constants/fonts';

// Global Input component that applies Pixelify Sans font by default
export const Input = (props: TextInputProps) => {
	const { style, ...rest } = props;
	
	return (
		<TextInput
			{...rest}
			style={[
				styles.defaultFont,
				style,
			]}
		/>
	);
};

const styles = StyleSheet.create({
	defaultFont: {
		fontFamily: Fonts.pixelify,
	},
});

