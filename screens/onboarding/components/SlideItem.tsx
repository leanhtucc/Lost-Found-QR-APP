import React from 'react';
import { View, Text, Animated, useWindowDimensions } from 'react-native';
import { SlideData } from '../data/slides';

interface SlideItemProps {
  item: SlideData;
  index: number;
  scrollX: Animated.Value;
  isCompactHeight?: boolean;
  pageWidth: number;
}

export const SlideItem: React.FC<SlideItemProps> = ({
  item,
  index,
  scrollX,
  isCompactHeight = false,
  pageWidth,
}) => {
  const { height } = useWindowDimensions();
  const inputRange = [(index - 1) * pageWidth, index * pageWidth, (index + 1) * pageWidth];

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
  const isUltraCompact = height < 640;

  return (
    <View className="flex-1 items-center" style={{ width: pageWidth }}>
      <Animated.View
        className="h-full w-full items-center justify-center"
        style={{ transform: [{ scale }, { translateY }], opacity }}
      >
        {/* Illustration từ Figma */}
        <View
          className={`w-full flex-grow items-center justify-center ${
            isCompactHeight ? 'max-h-[45%] min-h-[180px]' : 'max-h-[50%] min-h-[220px]'
          }`}
        >
          <View
            className={`w-full aspect-square items-center justify-center ${
              isCompactHeight ? 'max-w-[300px]' : 'max-w-[360px]'
            }`}
          >
            <IconComponent width="280%" height="100%" />
          </View>
        </View>

        {/* Text group */}
        <View className={`w-full items-center ${isCompactHeight ? 'mt-4 mb-2' : 'mt-8 mb-2'}`}>
          <Text
            className={`${isCompactHeight ? 'mt-2 text-2xl' : 'mt-3 text-3xl'} mb-4 px-2 text-center font-bold text-white`}
          >
            {item.title}
          </Text>
          <Text
            className={`${
              isUltraCompact
                ? 'text-sm leading-5 px-2'
                : isCompactHeight
                  ? 'text-sm leading-6 px-3'
                  : 'text-base leading-6 px-4'
            } max-w-xs text-center text-gray-400`}
          >
            {item.description}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

export default SlideItem;
