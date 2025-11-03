import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { Fonts } from '@/constants/fonts';

// Global Text component that applies Pixelify Sans font by default
export const Text = (props: RNTextProps) => {
	const { style, ...rest } = props;
	
	return (
		<RNText
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

