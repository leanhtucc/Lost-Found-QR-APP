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
  PublicItemDetailScreen,
  NotificationsScreen,
  ProfileScreen,
  EditProfileScreen,
  NotificationSettingsScreen,
  ChangePasswordScreen,
  DeleteAccountScreen,
  ReportItemsScreen,
  FoundItemReportScreen,
  ManualFoundReportScreen,
  ChatListScreen,
  ChatDetailScreen,
  LiveTrackingScreen,
  HandoverConfirmScreen,
  RewardStatusScreen,
  RateFinderScreen,
} from '@screens/index';
import { LoginScreen } from '@screens/auth/login';
import { RegisterScreen as AuthRegisterScreen } from '@screens/auth/register';
import { CongratulationScreen } from '@screens/auth/congratulation';
import { OnboardingScreen } from '@screens/onboarding';
import { TabNavigator } from './tab-navigator';
import FoundReportDetailScreen from '@/screens/found-report-detail';
import { appStorage } from '@storage/app';
import { useAuthContext } from '@contexts/AuthContext';
import { FIND_BACK } from '@constants/theme';
import AuthCodeVerifyScreen from '@/screens/auth/codeVerify';
import AuthForgotPasswordScreen from '@/screens/auth/forgotPass';
import AuthResetPasswordScreen from '@/screens/auth/resetPass';

import { useNotificationHandler } from '@/hooks/useNotificationHandler';

// Type definitions
export type RootStackParamList = {
  TabNavigator: { screen?: string };
  Home: undefined;
  Scan: undefined;
  Register: undefined;
  MyItems: undefined;
  ItemDetails: { itemId: string };
  PublicItemDetails: { itemId: string };
  ReportItems: undefined;
  FoundItemReport: undefined;
  ManualFoundReport: undefined;
  FoundReportDetails: { reportId: string };
  QRCodeView: { itemId: string };
  ScanResult: { qrData: string };
  Settings: undefined;
  Profile: undefined;
  EditProfile: undefined;
  NotificationSettings: undefined;
  ChangePassword: undefined;
  DeleteAccount: undefined;
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
    isVerified?: boolean;
  };
  LiveTracking: { returnSessionId: string };
  HandoverConfirm: { returnSessionId: string };
  RewardStatus: { returnSessionId: string };
  RateFinder: { returnSessionId: string };
  // Auth screens
  Onboarding: undefined;
  Login: undefined;
  AuthRegister: undefined;
  CodeVerify: { email: string };
  ForgotPassword: undefined;
  ResetPassword: { token?: string };
  Congratulation: undefined;
  SignUp: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AUTH_ROUTE_NAMES: (keyof RootStackParamList)[] = [
  'Onboarding',
  'Login',
  'AuthRegister',
  'CodeVerify',
  'ForgotPassword',
  'ResetPassword',
  'Congratulation',
];

// Deep linking configuration - Professional Lost & Found
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'lostfoundqr://', 'lostfound://', 'lostfoundapp://'],
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
      Login: 'login',
      AuthRegister: 'register',
      ForgotPassword: 'forgot-password',
    },
  },
};

// Screen options for smooth transitions
const screenOptions = {
  headerShown: false,
  // Lock swipe-to-go-back on every stack screen. Navigation can only go back
  // through an explicit button/action controlled by the app.
  gestureEnabled: false,
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

function NotificationHandler() {
  useNotificationHandler();
  return null;
}

export default function RootStack() {
  const navigationRef = useRef<any>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isNavReady, setIsNavReady] = useState(false);

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const completed = await appStorage.isOnboardingCompleted();
        setHasCompletedOnboarding(completed);
      } catch (error) {
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

  // Keep navigation state in sync with auth state changes
  useEffect(() => {
    if (!isNavReady || authLoading || isCheckingOnboarding || !navigationRef.current) {
      return;
    }

    const currentRouteName = navigationRef.current.getCurrentRoute()?.name as
      | keyof RootStackParamList
      | undefined;
    const isCurrentAuthRoute = currentRouteName
      ? AUTH_ROUTE_NAMES.includes(currentRouteName)
      : false;

    if (isAuthenticated) {
      if (!currentRouteName || isCurrentAuthRoute) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'TabNavigator' }],
        });
      }
      return;
    }

    const unauthTargetRoute: keyof RootStackParamList = hasCompletedOnboarding
      ? 'Login'
      : 'Onboarding';

    if (!currentRouteName || !isCurrentAuthRoute) {
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: unauthTargetRoute }],
      });
    }
  }, [isAuthenticated, hasCompletedOnboarding, authLoading, isCheckingOnboarding, isNavReady]);

  // Show loading while checking auth and onboarding status
  if (authLoading || isCheckingOnboarding) {
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

  return (
    <NavigationContainer ref={navigationRef} linking={linking} onReady={() => setIsNavReady(true)}>
      <NotificationHandler />
      <Stack.Navigator initialRouteName={getInitialRoute()} screenOptions={screenOptions}>
        {/* Auth Screens */}
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="AuthRegister"
          component={AuthRegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CodeVerify"
          component={AuthCodeVerifyScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={AuthForgotPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={AuthResetPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Congratulation"
          component={CongratulationScreen}
          options={{ headerShown: false }}
        />

        {/* Main App Screens */}
        <Stack.Screen
          name="TabNavigator"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Scan" component={ScanScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="FoundItemReport"
          component={FoundItemReportScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ManualFoundReport"
          component={ManualFoundReportScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="MyItems" component={MyItemsScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="FoundReportDetails"
          component={FoundReportDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ItemDetails"
          component={ItemDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PublicItemDetails"
          component={PublicItemDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ReportItems"
          component={ReportItemsScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NotificationSettings"
          component={NotificationSettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DeleteAccount"
          component={DeleteAccountScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Chat" component={ChatDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="LiveTracking"
          component={LiveTrackingScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="HandoverConfirm"
          component={HandoverConfirmScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="RewardStatus"
          component={RewardStatusScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="RateFinder"
          component={RateFinderScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
