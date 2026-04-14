import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  SharedValue,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '@/lib/cn';
import { FIND_BACK } from '@constants/theme';

interface AnimatedOtpBoxProps {
  digit: string;
  isFocused: boolean;
  hasValue: boolean;
  index: number;
  shakeOffset: SharedValue<number>;
}

export const AnimatedOtpBox: React.FC<AnimatedOtpBoxProps> = ({
  digit,
  isFocused,
  hasValue,
  index,
  shakeOffset,
}) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (hasValue) {
      scale.value = withSequence(withSpring(1.18, { damping: 8 }), withSpring(1, { damping: 10 }));
      glowOpacity.value = withTiming(1, { duration: 150 });
      return;
    }
    scale.value = withSpring(1);
    glowOpacity.value = withTiming(0, { duration: 100 });
  }, [digit, glowOpacity, hasValue, scale]);

  useEffect(() => {
    if (isFocused) {
      glowOpacity.value = withRepeat(
        withSequence(withTiming(1, { duration: 600 }), withTiming(0.3, { duration: 600 })),
        -1,
        true
      );
      return;
    }
    cancelAnimation(glowOpacity);
    glowOpacity.value = withTiming(hasValue ? 1 : 0, { duration: 200 });
  }, [glowOpacity, hasValue, isFocused]);

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shakeOffset.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowOpacity.value, [0, 1], [0, 0.6]),
    borderColor: isFocused ? FIND_BACK.primaryLight : FIND_BACK.secondary,
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()} style={boxStyle}>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius: 16,
            borderWidth: 1.5,
            margin: -1,
          },
          glowStyle,
        ]}
      />

      <View
        className={cn(
          'w-12 h-14 rounded-2xl items-center justify-center border',
          isFocused
            ? 'border-fb-primary bg-fb-neutral'
            : hasValue
              ? 'border-fb-border-subtle bg-fb-neutral'
              : 'border-transparent bg-fb-neutral'
        )}
      >
        <Text
          className={cn(
            'text-3xl font-semibold leading-none',
            hasValue ? 'text-white' : 'text-white/30'
          )}
        >
          {hasValue ? digit : '-'}
        </Text>
      </View>
    </Animated.View>
  );
};
