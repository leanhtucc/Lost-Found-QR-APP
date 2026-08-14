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
import { FIND_BACK } from '@/constants/theme';

const Tab = createBottomTabNavigator();
const TAB_ACTIVE_COLOR = FIND_BACK.primary;
const TAB_INACTIVE_COLOR = FIND_BACK.mutedText;

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
          tabBarLabel: 'Trang chủ',
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
          tabBarLabel: 'Đồ dùng',
          tabBarIcon: ({ color, size, focused }: TabBarIconProps) => (
            <Package size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarLabel: 'Quét',
          tabBarStyle: { display: 'none' }, // Ẩn tab bar khi ở màn scan
          tabBarIcon: ({ color, size, focused }: TabBarIconProps) => (
            <IconQrScan width={size} height={size} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatInbox"
        component={ChatListScreen}
        options={{
          tabBarLabel: 'Tin nhắn',
          tabBarIcon: ({ color, size, focused }: TabBarIconProps) => (
            <MessageCircle size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Tài khoản',
          tabBarIcon: ({ color, size, focused }: TabBarIconProps) => (
            <User size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
