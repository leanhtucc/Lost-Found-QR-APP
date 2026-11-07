/**
 * Navigation
 * Root navigation stack với authentication state management
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

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
import { linking } from './linking';
import { guestSessionStorage, type GuestSession } from '@/storage/guestSession';
import { guestSessionEvents } from '@/lib/guestSessionEvents';
import { canGuestAccessRoute } from './guestAccess';

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
    returnSessionId?: string;
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
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [isCheckingGuestSession, setIsCheckingGuestSession] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadGuestSession = async () => {
      const session = await guestSessionStorage.get();
      if (mounted) {
        setGuestSession(session);
        setIsCheckingGuestSession(false);
      }
    };
    const unsubscribe = guestSessionEvents.subscribe(() => {
      void loadGuestSession();
    });
    void loadGuestSession();
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

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
    if (
      !isNavReady ||
      authLoading ||
      isCheckingOnboarding ||
      isCheckingGuestSession ||
      !navigationRef.current
    ) {
      return;
    }

    const currentRouteName = navigationRef.current.getCurrentRoute()?.name as
      | keyof RootStackParamList
      | undefined;
    const isCurrentAuthRoute = currentRouteName
      ? AUTH_ROUTE_NAMES.includes(currentRouteName)
      : false;
    const currentParams = navigationRef.current.getCurrentRoute()?.params as
      | Record<string, unknown>
      | undefined;
    const isCurrentGuestRoute = currentRouteName
      ? canGuestAccessRoute(currentRouteName, currentParams, guestSession)
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

    if (!currentRouteName || (!isCurrentAuthRoute && !isCurrentGuestRoute)) {
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: unauthTargetRoute }],
      });
    }
  }, [
    isAuthenticated,
    hasCompletedOnboarding,
    authLoading,
    isCheckingOnboarding,
    isCheckingGuestSession,
    isNavReady,
    guestSession,
  ]);

  const handleNavigationStateChange = useCallback(() => {
    if (
      !isNavReady ||
      authLoading ||
      isCheckingOnboarding ||
      isCheckingGuestSession ||
      isAuthenticated ||
      !navigationRef.current
    )
      return;

    void (async () => {
      const session = await guestSessionStorage.get();
      setGuestSession(session);
      const route = navigationRef.current?.getCurrentRoute();
      if (!route || AUTH_ROUTE_NAMES.includes(route.name as keyof RootStackParamList)) return;
      if (
        canGuestAccessRoute(
          route.name,
          route.params as Record<string, unknown> | undefined,
          session
        )
      )
        return;
      if (navigationRef.current?.canGoBack()) {
        navigationRef.current.goBack();
      } else {
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: hasCompletedOnboarding ? 'Login' : 'Onboarding' }],
        });
      }
    })();
  }, [
    authLoading,
    hasCompletedOnboarding,
    isAuthenticated,
    isCheckingGuestSession,
    isCheckingOnboarding,
    isNavReady,
  ]);

  // Show loading while checking auth and onboarding status
  if (authLoading || isCheckingOnboarding || isCheckingGuestSession) {
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
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      onReady={() => setIsNavReady(true)}
      onStateChange={handleNavigationStateChange}
    >
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
