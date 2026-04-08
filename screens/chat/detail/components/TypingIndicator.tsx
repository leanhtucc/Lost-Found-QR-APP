/**
 * Typing Indicator Component
 * Hiển thị animated dots khi user đang typing
 */

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';

export const TypingIndicator: React.FC = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(withTiming(-5, { duration: 400 }), withTiming(0, { duration: 400 })),
      -1
    );

    setTimeout(() => {
      dot2.value = withRepeat(
        withSequence(withTiming(-5, { duration: 400 }), withTiming(0, { duration: 400 })),
        -1
      );
    }, 150);

    setTimeout(() => {
      dot3.value = withRepeat(
        withSequence(withTiming(-5, { duration: 400 }), withTiming(0, { duration: 400 })),
        -1
      );
    }, 300);
  }, [dot1, dot2, dot3]);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1.value }],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2.value }],
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3.value }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(300)} className="flex-row justify-start mb-2">
      <View className="bg-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
        <View className="flex-row gap-1.5">
          <Animated.View style={animatedStyle1} className="w-2 h-2 rounded-full bg-gray-400" />
          <Animated.View style={animatedStyle2} className="w-2 h-2 rounded-full bg-gray-400" />
          <Animated.View style={animatedStyle3} className="w-2 h-2 rounded-full bg-gray-400" />
        </View>
      </View>
    </Animated.View>
  );
};
