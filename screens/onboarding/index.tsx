import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Animated as RNAnimated,
  StatusBar,
  ViewToken,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';
import { Button } from '@components/atoms/Button';
import { SlideItem } from './components/SlideItem';
import { DotIndicator } from './components/DotIndicator';
import { SplashScreen } from './components/SplashScreen';
import { slides } from './data/slides';
import { appStorage } from '@storage/app';
import { ResponsiveContainer } from '@components/atoms/ResponsiveContainer';
import { IconLogoOnboarding } from '@components/icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

type OnboardingNavigationProp = StackNavigationProp<RootStackParamList>;

interface ViewableItemsChanged {
  viewableItems: ViewToken[];
  changed: ViewToken[];
}

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const insets = useSafeAreaInsets();

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
    <View style={{ flex: 1, backgroundColor: '#0E0E13' }}>
      <Animated.View style={[{ flex: 1, backgroundColor: '#0E0E13' }, enterAnimatedStyle]}>
        <SafeAreaView className="flex-1 bg-[#0E0E13]" edges={['top', 'bottom']}>
          <StatusBar barStyle="light-content" backgroundColor="#0E0E13" />
          <ResponsiveContainer className="flex-1" variant="form">
            {/* ── Header: Logo FindBack + Skip ── */}
            <View className="flex-row items-center justify-between px-5 py-3">
              <View className="flex-row items-center gap-[7px]">
                <IconLogoOnboarding width={32} height={32} />
                <Text className="text-[#F9F5FD] text-base font-bold tracking-[0.1px]">
                  FindBack
                </Text>
              </View>
              <TouchableOpacity onPress={handleSkip} className="py-1 px-1.5" activeOpacity={0.6}>
                <Text className="text-[#ACAAB1] text-sm font-medium">Skip</Text>
              </TouchableOpacity>
            </View>

            {/* ── Slides ── */}
            <View className="flex-1">
              <RNAnimated.FlatList
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
                onScroll={RNAnimated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                  useNativeDriver: false,
                })}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                scrollEventThrottle={16}
              />
            </View>

            {/* ── Bottom: Dots + CTA ── */}
            <View className="px-4 pt-1" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
              <DotIndicator data={slides} scrollX={scrollX} onDotPress={handleDotPress} />

              {/* Design Spell: spring scale bọc ngoài Button — scale là Animated.Value bắt buộc inline */}
              <RNAnimated.View style={{ transform: [{ scale: buttonScale }] }}>
                {/* style → tăng minHeight; textClassName → text trắng sáng; rightIcon → icon từ slides.ts */}
                <Button
                  variant="primary"
                  onPress={handleNext}
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                  style={{ minHeight: 64 }}
                  textClassName="text-white text-[17px] font-bold tracking-[0.3px]"
                  rightIcon={renderedButtonIcon}
                >
                  {buttonLabel}
                </Button>
              </RNAnimated.View>
            </View>
          </ResponsiveContainer>
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
