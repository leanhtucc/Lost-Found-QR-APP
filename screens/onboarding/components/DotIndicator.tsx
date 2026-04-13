import React from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { SlideData } from '../data/slides';

interface DotIndicatorProps {
  data: SlideData[];
  scrollX: Animated.Value;
  onDotPress: (index: number) => void;
  isCompactHeight?: boolean;
  pageWidth: number;
}

export const DotIndicator: React.FC<DotIndicatorProps> = ({
  data,
  scrollX,
  onDotPress,
  isCompactHeight = false,
  pageWidth,
}) => {
  return (
    <View
      className={`flex-row items-center justify-center gap-2 ${isCompactHeight ? 'my-5' : 'my-8'}`}
    >
      {data.map((_, index) => {
        const inputRange = [(index - 1) * pageWidth, index * pageWidth, (index + 1) * pageWidth];

        // width, backgroundColor, opacity là Animated.Value → bắt buộc dùng inline style
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [6, 20, 6],
          extrapolate: 'clamp',
        });

        const backgroundColor = scrollX.interpolate({
          inputRange,
          outputRange: ['#48474D', '#715FEA', '#48474D'],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.45, 1, 0.45],
          extrapolate: 'clamp',
        });

        return (
          <TouchableOpacity
            key={index}
            onPress={() => onDotPress(index)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Animated.View
              className="h-1.5 rounded-full"
              style={{ width: dotWidth, backgroundColor, opacity }}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default DotIndicator;
