import { BottomTabBar } from '@/components/molecules/BottomTab';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Package, MessageCircle, User } from 'lucide-react-native';
import {
  HomeScreen,
  ScanScreen,
  MyItemsScreen,
  ProfileScreen,
  ChatListScreen,
} from '@screens/index';
import { IconQrScan } from '@/components/icons';

const Tab = createBottomTabNavigator();
const TAB_ACTIVE_COLOR = '#6C4CF1';
const TAB_INACTIVE_COLOR = '#9AA0B3';

interface TabBarIconProps {
  color: string;
  size: number;
  focused: boolean;
}

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: TAB_ACTIVE_COLOR,
        tabBarInactiveTintColor: TAB_INACTIVE_COLOR,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }: TabBarIconProps) => (
            <Home
              size={size}
              color={color}
              fill={focused ? color : 'none'}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tab.Screen
        name="MyItems"
        component={MyItemsScreen}
        options={{
          tabBarLabel: 'My Items',
          tabBarIcon: ({ color, size, focused }: TabBarIconProps) => (
            <Package size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarLabel: 'Scan',
          tabBarStyle: { display: 'none' }, // Ẩn tab bar khi ở màn scan
          tabBarIcon: ({ color, size, focused }: TabBarIconProps) => (
            <IconQrScan width={size} height={size} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatListScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color, size, focused }: TabBarIconProps) => (
            <MessageCircle size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }: TabBarIconProps) => (
            <User size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
