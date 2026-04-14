import React from 'react';
import { Text } from 'react-native';
import Animated, { SharedValue, ZoomIn } from 'react-native-reanimated';

interface CodeVerifyErrorProps {
  error?: string;
  shakeOffset: SharedValue<number>;
}

export const CodeVerifyError: React.FC<CodeVerifyErrorProps> = ({ error, shakeOffset }) => {
  if (!error) return null;

  return (
    <Animated.View
      entering={ZoomIn.duration(200)}
      style={{ transform: [{ translateX: shakeOffset }] }}
      className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4"
    >
      <Text className="text-red-400 text-sm text-center">{error}</Text>
    </Animated.View>
  );
};
