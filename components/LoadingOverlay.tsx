import { CustomText as Text } from '@/components/ui/CustomText';
import colors from '@/constants/colors';
import fonts from '@/constants/fonts';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Dimensions, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function LoadingOverlay({
  visible,
  title = 'Loading',
}: {
  visible: boolean;
  title?: string;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  if (!visible && fadeAnim._value === 0) return null;

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[styles.overlay, { opacity: fadeAnim, paddingBottom: insets.bottom }]}
    >
      <View style={styles.box}>
        <ActivityIndicator size="large" color={colors.white} />
        <Text style={styles.text}>{title}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    width,
    height,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  box: {
    // backgroundColor: 'rgba(0, 0, 0, 0.65)',
    // borderRadius: 16,
    // padding: 16,
    // alignItems: 'center',
    // minWidth: 100,
    // minHeight: 100,
  },
  text: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: fonts.fontSFProDisplaySemibold,
  },
});
