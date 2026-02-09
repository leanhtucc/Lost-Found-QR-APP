/**
 * Navigation
 * Root navigation stack với authentication state management
 */

import React, { useRef, useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Linking from 'expo-linking';

// Screens
import {
  HomeScreen,
  ScanScreen,
  MyItemsScreen,
  ItemDetailScreen,
  FoundItemScreen,
  NotificationsScreen,
  ProfileScreen,
  ChatListScreen,
  ChatDetailScreen,
} from '@screens/index';
import { LoginScreen } from '@screens/auth/login';
import { RegisterScreen as AuthRegisterScreen } from '@screens/auth/register';
import { CodeVerifyScreen } from '@screens/auth/codeVerify';
import { ForgotPasswordScreen } from '@screens/auth/forgotPass';
import { ResetPasswordScreen } from '@screens/auth/resetPass';
import { CongratulationScreen } from '@screens/auth/congratulation';
import { OnboardingScreen } from '@screens/onboarding';
import { TabNavigator } from './tab-navigator';
import { appStorage } from '@storage/app';
import { useAuthContext } from '@contexts/AuthContext';

// Type definitions
export type RootStackParamList = {
  TabNavigator: { screen?: string };
  Home: undefined;
  Scan: undefined;
  Register: undefined;
  MyItems: undefined;
  ItemDetails: { itemId: string };
  FoundItem: { scanData: any }; // For Finder Flow - displays scanned item info
  QRCodeView: { itemId: string };
  ScanResult: { qrData: string };
  Settings: undefined;
  Profile: undefined;
  EditItem: { itemId: string };
  Notifications: undefined;
  Help: undefined;
  ChatList: undefined;
  Chat: {
    channelId: string;
    itemName: string;
    userName: string;
    userAvatar?: string;
    memberId?: string; // For connecting with memberId
  };
  // Auth screens
  Onboarding: undefined;
  Login: undefined;
  AuthRegister: undefined;
  CodeVerify: { phoneNumber?: string };
  ForgotPassword: undefined;
  ResetPassword: { token?: string };
  Congratulation: undefined;
  SignUp: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Deep linking configuration - Professional Lost & Found
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'lostfound://', 'lostfoundapp://'],
  config: {
    screens: {
      ResetPassword: {
        path: 'reset-password',
        parse: {
          token: (token: string) => token,
        },
      },
      ItemDetails: {
        path: 'item/:itemId',
        parse: {
          itemId: (itemId: string) => itemId,
        },
      },
      FoundItem: {
        path: 'found/:itemId',
        parse: {
          itemId: (itemId: string) => itemId,
        },
      },
      Login: 'login',
      AuthRegister: 'register',
      ForgotPassword: 'forgot-password',
    },
  },
};

// Screen options for smooth transitions
const screenOptions = {
  headerShown: false,
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
  transitionSpec: {
    open: { animation: 'timing' as const, config: { duration: 300 } },
    close: { animation: 'timing' as const, config: { duration: 250 } },
  },
  cardStyleInterpolator: ({ current, next, layouts }: any) => ({
    cardStyle: {
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.width, 0],
          }),
        },
        {
          translateX: next
            ? next.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -layouts.screen.width],
              })
            : 0,
        },
      ],
    },
  }),
};

export default function RootStack() {
  const navigationRef = useRef<any>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const completed = await appStorage.isOnboardingCompleted();
        setHasCompletedOnboarding(completed);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  // Determine initial route based on auth state and onboarding
  const getInitialRoute = (): keyof RootStackParamList => {
    if (isAuthenticated) {
      return 'TabNavigator';
    }
    return hasCompletedOnboarding ? 'Login' : 'Onboarding';
  };

  // Show loading while checking auth and onboarding status
  if (authLoading || isCheckingOnboarding) {
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}
      >
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator initialRouteName={getInitialRoute()} screenOptions={screenOptions}>
        {/* Auth Screens */}
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AuthRegister" component={AuthRegisterScreen} />
        <Stack.Screen name="CodeVerify" component={CodeVerifyScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Congratulation" component={CongratulationScreen} />

        {/* Main App Screens */}
        <Stack.Screen name="TabNavigator" component={TabNavigator} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Scan" component={ScanScreen} />
        <Stack.Screen name="MyItems" component={MyItemsScreen} />
        <Stack.Screen name="ItemDetails" component={ItemDetailScreen} />
        <Stack.Screen name="FoundItem" component={FoundItemScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="ChatList" component={ChatListScreen} />
        <Stack.Screen name="Chat" component={ChatDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
