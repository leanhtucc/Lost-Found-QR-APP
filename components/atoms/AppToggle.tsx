/**
 * AppToggle Component
 * Premium animated custom switch / toggle with smooth transitions
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { FIND_BACK } from '@/constants/theme';

export interface AppToggleProps {
  value?: boolean;
  active?: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  activeTrackColor?: string;
  inactiveTrackColor?: string;
  activeKnobColor?: string;
  inactiveKnobColor?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

const SIZES = {
  sm: {
    width: 42,
    height: 24,
    padding: 2,
  },
  md: {
    width: 50,
    height: 28,
    padding: 2.5,
  },
  lg: {
    width: 58,
    height: 32,
    padding: 3,
  },
};

export const AppToggle: React.FC<AppToggleProps> = ({
  value,
  active,
  onValueChange,
  disabled = false,
  size = 'md',
  activeTrackColor = FIND_BACK.primary,
  inactiveTrackColor = '#25252D',
  activeKnobColor = '#FFFFFF',
  inactiveKnobColor = '#E4E4E7',
  style,
  testID,
  accessibilityLabel,
}) => {
  const isActive = value ?? active ?? false;
  const config = SIZES[size] || SIZES.md;
  const knobSize = config.height - config.padding * 2;
  const translateXTarget = config.width - config.padding * 2 - knobSize;

  const progress = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const isInteractive = Boolean(onValueChange) && !disabled;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isActive ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isActive, progress]);

  const trackColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveTrackColor, activeTrackColor],
  });

  const knobColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveKnobColor, activeKnobColor],
  });

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, translateXTarget],
  });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: isActive, disabled }}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      disabled={!isInteractive}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      onPress={() => onValueChange?.(!isActive)}
      style={({ pressed }) => [
        {
          width: config.width,
          height: config.height,
          opacity: disabled ? 0.45 : pressed && isInteractive ? 0.8 : 1,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.track,
          {
            width: config.width,
            height: config.height,
            padding: config.padding,
            backgroundColor: trackColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.knob,
            {
              width: knobSize,
              height: knobSize,
              backgroundColor: knobColor,
              transform: [{ translateX }],
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    borderRadius: 999,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  knob: {
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default AppToggle;
