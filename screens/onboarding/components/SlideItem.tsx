import React from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { SlideData } from '../data/slides';

const { width } = Dimensions.get('window');

interface SlideItemProps {
  item: SlideData;
  index: number;
  scrollX: Animated.Value;
}

export const SlideItem: React.FC<SlideItemProps> = ({ item, index, scrollX }) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.8, 1, 0.8],
    extrapolate: 'clamp',
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.4, 1, 0.4],
    extrapolate: 'clamp',
  });

  const translateY = scrollX.interpolate({
    inputRange,
    outputRange: [30, 0, 30],
    extrapolate: 'clamp',
  });

  const IconComponent = item.icon;

  return (
    <View style={{ width }} className="flex-1 items-center justify-center px-8">
      <Animated.View
        style={{
          transform: [{ scale }, { translateY }],
          opacity,
        }}
        className="items-center"
      >
        {/* Icon Container */}
        <View
          style={{ backgroundColor: item.bgColor }}
          className="w-32 h-32 rounded-3xl items-center justify-center mb-8 shadow-lg"
        >
          <IconComponent size={64} color={item.color} strokeWidth={1.5} />
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold text-gray-900 text-center mb-4">{item.title}</Text>

        {/* Description */}
        <Text className="text-base text-gray-500 text-center leading-6 max-w-xs">
          {item.description}
        </Text>
      </Animated.View>
    </View>
  );
};

export default SlideItem;
