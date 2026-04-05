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

  // Tất cả interpolation là Animated.Value → bắt buộc dùng inline style
  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.85, 1, 0.85],
    extrapolate: 'clamp',
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.3, 1, 0.3],
    extrapolate: 'clamp',
  });

  const translateY = scrollX.interpolate({
    inputRange,
    outputRange: [28, 0, 28],
    extrapolate: 'clamp',
  });

  const { IconComponent } = item;

  return (
    <View className="flex-1 items-center justify-start pt-2" style={{ width }}>
      <Animated.View
        className="items-center w-full"
        style={{ transform: [{ scale }, { translateY }], opacity }}
      >
        {/* Illustration từ Figma */}
        <View className="items-center justify-center mb-7">
          <IconComponent width={width * 3} height={width * 0.9} />
        </View>

        {/* Text group */}
        <View className="px-7 items-center">
          <Text className="text-[#F9F5FD] text-[26px] font-bold text-center mb-3 leading-[34px] tracking-[-0.3px]">
            {item.title}
          </Text>
          <Text className="text-[#ACAAB1] text-[15px] text-center leading-[22px] max-w-[300px]">
            {item.description}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

export default SlideItem;
