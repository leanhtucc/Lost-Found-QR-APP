import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Animated,
  StatusBar,
  ViewToken,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';
import { SlideItem } from './components/SlideItem';
import { DotIndicator } from './components/DotIndicator';
import { slides } from './data/slides';
import { appStorage } from '@storage/app';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type OnboardingNavigationProp = StackNavigationProp<RootStackParamList>;

interface ViewableItemsChanged {
  viewableItems: ViewToken[];
  changed: ViewToken[];
}

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const handleComplete = async () => {
    // Save onboarding completed status
    await appStorage.setOnboardingCompleted();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleDotPress = (index: number) => {
    flatListRef.current?.scrollToIndex({ index });
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: ViewableItemsChanged) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Skip Button */}
      <View className="flex-row justify-end px-6" style={{ marginTop: insets.top }}>
        <TouchableOpacity onPress={handleSkip} className="py-2 px-4">
          <Text className="text-gray-500 text-base">Bỏ qua</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <View className="flex-1">
        <Animated.FlatList
          ref={flatListRef}
          data={slides}
          renderItem={({ item, index }) => (
            <SlideItem item={item} index={index} scrollX={scrollX} />
          )}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          scrollEventThrottle={16}
        />
      </View>

      {/* Bottom Section */}
      <View className="px-6 pb-8" style={{ paddingBottom: 8 + insets.bottom }}>
        {/* Dot Indicators */}
        <DotIndicator data={slides} scrollX={scrollX} onDotPress={handleDotPress} />

        {/* Next / Get Started Button */}
        <TouchableOpacity
          onPress={handleNext}
          className="h-14 bg-blue-600 rounded-2xl justify-center items-center flex-row active:bg-blue-700"
        >
          <Text className="text-white font-semibold text-base">
            {currentIndex === slides.length - 1 ? 'Bắt đầu ngay' : 'Tiếp tục'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
