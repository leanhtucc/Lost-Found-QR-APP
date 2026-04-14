import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Animated as RNAnimated,
  StatusBar,
  ViewToken,
  Dimensions,
} from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';
import { SlideItem } from './components/SlideItem';
import { DotIndicator } from './components/DotIndicator';
import { slides } from './data/slides';
import { appStorage } from '@storage/app';
import { IconLogoOnboarding } from '@components/icons';
import { FIND_BACK } from '@constants/theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { SplashScreen } from './SplashScreen';

type OnboardingNavigationProp = StackNavigationProp<RootStackParamList>;

interface ViewableItemsChanged {
  viewableItems: ViewToken[];
  changed: ViewToken[];
}

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const isCompactHeight = screenHeight < 700;
  const pageWidth = Math.max(screenWidth - 48, 280);

  // State
  const [showSplash, setShowSplash] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new RNAnimated.Value(0)).current;
  // Animated value cho spring press — phải dùng inline style
  const buttonScale = useRef(new RNAnimated.Value(1)).current;

  // Reanimated 3 Values
  const enterOpacity = useSharedValue(0);
  const enterTranslateY = useSharedValue(50);
  const customEasing = Easing.bezier(0.25, 0.1, 0.25, 1);

  useEffect(() => {
    // Không chờ showSplash tắt hẳn nữa để tránh gián đoạn/chớp trắng
    // Splash đè bên trên sẽ bắt đầu mờ từ 1200ms
    // Onboarding ở dưới sẽ bắt đầu Fade-in & Slide-up từ 1400ms tạo hiệu ứng cross-fade siêu đẹp
    enterOpacity.value = withDelay(1400, withTiming(1, { duration: 1200, easing: customEasing }));
    enterTranslateY.value = withDelay(
      1400,
      withTiming(0, { duration: 1200, easing: customEasing })
    );
  }, [customEasing, enterOpacity, enterTranslateY]);

  const enterAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: enterOpacity.value,
      transform: [{ translateY: enterTranslateY.value }],
    };
  });

  // Handlers
  const handleComplete = useCallback(async () => {
    await appStorage.setOnboardingCompleted();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }, [navigation]);

  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      handleComplete();
    }
  }, [currentIndex, handleComplete]);

  const handleSkip = useCallback(() => handleComplete(), [handleComplete]);

  const handleDotPress = useCallback((index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: ViewableItemsChanged) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index!);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  // Design Spell: spring press feedback trên nút CTA
  const onPressIn = () => {
    RNAnimated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
      damping: 12,
      stiffness: 200,
    }).start();
  };

  const onPressOut = () => {
    RNAnimated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 10,
      stiffness: 180,
    }).start();
  };

  const currentSlide = slides[currentIndex];
  const buttonLabel = currentSlide?.buttonLabel ?? 'Next →';
  // Render ButtonIcon từ slides.ts thành ReactNode cho rightIcon của Button
  const { ButtonIcon, buttonIconProps } = currentSlide ?? {};
  const renderedButtonIcon = ButtonIcon ? <ButtonIcon {...(buttonIconProps ?? {})} /> : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: FIND_BACK.canvas }}>
      <Animated.View style={[{ flex: 1, backgroundColor: FIND_BACK.canvas }, enterAnimatedStyle]}>
        <SafeAreaView
          className="flex-1"
          style={{ backgroundColor: FIND_BACK.canvas }}
          edges={['top', 'bottom']}
        >
          <StatusBar barStyle="light-content" backgroundColor={FIND_BACK.canvas} />
          <View
            className="flex-1 px-6"
            style={{
              paddingTop: Math.max(Constants.statusBarHeight * 0.08, 2),
            }}
          >
            {/* ── Header: Logo FindBack + Skip ── */}
            <View
              className={`flex-row items-center justify-between ${isCompactHeight ? 'mt-2' : 'mt-4'}`}
            >
              <View className="flex-row items-center gap-[7px]">
                <IconLogoOnboarding width={32} height={32} />
                <Text className="text-fb-content text-base font-bold tracking-[0.1px]">
                  FindBack
                </Text>
              </View>
              <TouchableOpacity onPress={handleSkip} className="px-1.5 py-1" activeOpacity={0.6}>
                <Text className="text-sm font-medium text-gray-400">Skip</Text>
              </TouchableOpacity>
            </View>

            {/* ── Slides ── */}
            <View className="flex-1">
              <RNAnimated.FlatList
                ref={flatListRef}
                data={slides}
                renderItem={({ item, index }) => (
                  <SlideItem
                    item={item}
                    index={index}
                    scrollX={scrollX}
                    isCompactHeight={isCompactHeight}
                    pageWidth={pageWidth}
                  />
                )}
                keyExtractor={item => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                bounces={false}
                onScroll={RNAnimated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                  useNativeDriver: false,
                })}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                scrollEventThrottle={16}
              />
            </View>

            {/* ── Bottom: Dots + CTA ── */}
            <View className="mt-auto">
              <DotIndicator
                data={slides}
                scrollX={scrollX}
                onDotPress={handleDotPress}
                isCompactHeight={isCompactHeight}
                pageWidth={pageWidth}
              />

              {/* Design Spell: spring scale bọc ngoài Button — scale là Animated.Value bắt buộc inline */}
              <RNAnimated.View
                style={{ transform: [{ scale: buttonScale }] }}
                className={isCompactHeight ? 'mb-6' : 'mb-10'}
              >
                <TouchableOpacity
                  onPress={handleNext}
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                  activeOpacity={0.9}
                  className="h-14 w-full flex-row items-center justify-center rounded-2xl bg-fb-primary"
                >
                  <Text
                    className={
                      isCompactHeight
                        ? 'text-base font-bold tracking-[0.2px] text-white'
                        : 'text-lg font-bold tracking-[0.3px] text-white'
                    }
                  >
                    {buttonLabel}
                  </Text>
                  {renderedButtonIcon ? <View className="ml-2">{renderedButtonIcon}</View> : null}
                </TouchableOpacity>
              </RNAnimated.View>

              <View style={{ height: Math.max(insets.bottom - 6, 0) }} />
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
      {showSplash && (
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 999 }}>
          <SplashScreen onFinish={() => setShowSplash(false)} />
        </View>
      )}
    </View>
  );
};

export default OnboardingScreen;
