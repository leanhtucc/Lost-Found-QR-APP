import { Text, TextProps } from 'react-native';

type Props = TextProps;

export const CustomText: React.FC<Props> = ({ allowFontScaling = true, ...props }) => {
  return <Text allowFontScaling={allowFontScaling} {...props} />;
};
