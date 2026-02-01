/**
 * FloatingButton Component
 * FAB button để thêm item mới
 */

import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

interface FloatingButtonProps {
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const FloatingButton: React.FC<FloatingButtonProps> = ({ onPress }) => {
  const scale = useSharedValue(0);

  // Animate on mount
  React.useEffect(() => {
    scale.value = withDelay(500, withSpring(1, { damping: 12 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      activeOpacity={0.8}
      style={animatedStyle}
      className="absolute bottom-6 right-6 w-16 h-16 rounded-full bg-blue-600 items-center justify-center shadow-lg"
    >
      <Plus size={28} color="white" />
    </AnimatedTouchable>
  );
};

export default FloatingButton;
