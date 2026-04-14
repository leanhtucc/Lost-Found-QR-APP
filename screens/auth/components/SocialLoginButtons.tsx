import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS, FIND_BACK } from '@constants/theme';

interface SocialLoginButtonsProps {
  onGooglePress: () => void;
  onApplePress: () => void;
}

const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" className="mr-3">
    <Path
      fill={COLORS.googleBlue}
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <Path
      fill={COLORS.googleGreen}
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <Path
      fill={COLORS.googleYellow}
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <Path
      fill={COLORS.googleRed}
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </Svg>
);

const AppleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill={FIND_BACK.bodyText} className="mr-2">
    <Path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </Svg>
);

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onGooglePress,
  onApplePress,
}) => {
  return (
    <View className="mt-8">
      {/* Divider */}
      <View className="flex-row items-center mb-6">
        <View className="flex-1 h-[1px] bg-white/10" />
        <Text className="px-4 text-[11px] text-gray-500 font-medium tracking-widest uppercase">
          Hoặc tiếp tục với
        </Text>
        <View className="flex-1 h-[1px] bg-white/10" />
      </View>

      {/* Buttons Container */}
      <View className="flex-row justify-between space-x-4 gap-4">
        {/* Google Button */}
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center h-[52px] rounded-2xl bg-fb-surface-muted active:opacity-70"
          onPress={onGooglePress}
        >
          <GoogleIcon />
          <Text className="text-sm font-semibold text-white ml-2">Google</Text>
        </TouchableOpacity>

        {/* Apple Button */}
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center h-[52px] rounded-2xl bg-fb-surface-muted active:opacity-70"
          onPress={onApplePress}
        >
          <AppleIcon />
          <Text className="text-sm font-semibold text-white ml-2">Apple</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SocialLoginButtons;
