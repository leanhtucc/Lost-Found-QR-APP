import * as React from 'react';
import { TextInput as RNTextInput, TextInputProps } from 'react-native';

type Props = TextInputProps;

export const CustomTextInput = React.forwardRef<RNTextInput, Props>((props, ref) => {
  return <RNTextInput ref={ref} allowFontScaling={false} {...props} />;
});

export default CustomTextInput;
