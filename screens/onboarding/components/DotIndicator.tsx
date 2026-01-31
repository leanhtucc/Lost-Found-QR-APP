import React from 'react';
import { View, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { SlideData } from '../data/slides';

const { width } = Dimensions.get('window');

interface DotIndicatorProps {
  data: SlideData[];
  scrollX: Animated.Value;
  _currentIndex?: number;
  onDotPress: (index: number) => void;
}

export const DotIndicator: React.FC<DotIndicatorProps> = ({ data, scrollX, onDotPress }) => {
  return (
    <View className="flex-row justify-center items-center mb-6 gap-2">
      {data.map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <TouchableOpacity key={index} onPress={() => onDotPress(index)}>
            <Animated.View
              style={{
                width: dotWidth,
                opacity,
              }}
              className="h-2 rounded-full bg-blue-600"
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default DotIndicator;
