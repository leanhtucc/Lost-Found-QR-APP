import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { FIND_BACK } from '@constants/theme';
import { RootStackParamList } from './index';

/**
 * InitialNavigator Component
 *
 * Determines the first screen to show after app loads.
 * For Lost & Found QR app, we directly navigate to TabNavigator.
 *
 * This can be extended later to:
 * - Check if user has completed onboarding
 * - Check authentication status
 * - Show splash/intro screens
 */
export default function InitialNavigator() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    // Navigate directly to TabNavigator
    // You can add checks here later (onboarding, auth, etc.)
    const timer = setTimeout(() => {
      navigation.replace('TabNavigator', {});
    }, 500); // Small delay for smooth transition

    return () => clearTimeout(timer);
  }, [navigation]);

  // Show loading while navigating
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: FIND_BACK.canvas,
      }}
    >
      <ActivityIndicator size="large" color={FIND_BACK.primary} />
    </View>
  );
}
