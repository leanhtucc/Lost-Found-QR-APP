import React, { useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import { HomeScreen, ScanScreen, RegisterScreen, MyItemsScreen } from '@screens/index';
import { LoginScreen } from '@screens/auth/login';
import { RegisterScreen as AuthRegisterScreen } from '@screens/auth/register';
import { CodeVerifyScreen } from '@screens/auth/codeVerify';
import { ForgotPasswordScreen } from '@screens/auth/forgotPass';
import { ResetPasswordScreen } from '@screens/auth/resetPass';
import { TabNavigator } from './tab-navigator';

// Type definitions
export type RootStackParamList = {
  TabNavigator: { screen?: string };
  Home: undefined;
  Scan: undefined;
  Register: undefined;
  MyItems: undefined;
  // Add more screens as needed
  ItemDetails: { itemId: string };
  QRCodeView: { itemId: string };
  ScanResult: { qrData: string };
  Settings: undefined;
  Profile: undefined;
  EditItem: { itemId: string };
  Notifications: undefined;
  Help: undefined;
  // Auth screens
  Login: undefined;
  AuthRegister: undefined;
  CodeVerify: { phoneNumber?: string };
  ForgotPassword: undefined;
  ResetPassword: undefined;
  SignUp: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootStack() {
  const navigationRef = useRef<any>(null);

  // For now, we'll assume user is not logged in
  // In the future, this can be replaced with actual auth state management
  const isLoggedIn = false; // Change to true to test logged-in flow
  const [isLoading] = useState(false);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}
      >
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? 'TabNavigator' : 'Login'}
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 300,
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 250,
              },
            },
          },
          cardStyleInterpolator: ({ current, next, layouts }) => {
            return {
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
            };
          },
        }}
      >
        {/* Auth Screens - shown first when not logged in */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="AuthRegister"
          component={AuthRegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CodeVerify"
          component={CodeVerifyScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          options={{ headerShown: false }}
        />

        {/* Main App Screens */}
        <Stack.Screen
          name="TabNavigator"
          component={TabNavigator}
          options={{ headerShown: false }}
        />

        {/* Individual screen routes (can be accessed directly) */}
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Scan" component={ScanScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MyItems" component={MyItemsScreen} options={{ headerShown: false }} />

        {/* Additional screens can be added here */}
        {/* 
        <Stack.Screen
          name="ItemDetails"
          component={ItemDetailsScreen}
          options={{ 
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="QRCodeView"
          component={QRCodeViewScreen}
          options={{ 
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="ScanResult"
          component={ScanResultScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditItem"
          component={EditItemScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Help"
          component={HelpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ 
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ 
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ 
            headerShown: false,
            presentation: 'modal',
          }}
        />
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
