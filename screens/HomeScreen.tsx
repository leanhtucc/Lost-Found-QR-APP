import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { QrCode, Package, Search, TrendingUp, Shield, Zap } from 'lucide-react-native';

export const HomeScreen = ({ navigation }: any) => {
  const stats = [
    { label: 'Items Registered', value: '3', icon: Package, color: 'bg-blue-500' },
    { label: 'Total Scans', value: '0', icon: QrCode, color: 'bg-green-500' },
    { label: 'Success Rate', value: '100%', icon: TrendingUp, color: 'bg-purple-500' },
  ];

  const features = [
    {
      title: 'Scan QR Code',
      description: 'Quickly scan QR codes to find lost items',
      icon: QrCode,
      color: 'from-blue-500 to-blue-600',
      action: 'Scan',
    },
    {
      title: 'Register Item',
      description: 'Add your belongings to keep them safe',
      icon: Package,
      color: 'from-green-500 to-emerald-600',
      action: 'Register',
    },
    {
      title: 'My Items',
      description: 'View and manage your registered items',
      icon: Search,
      color: 'from-purple-500 to-indigo-600',
      action: 'MyItems',
    },
  ];

  return (
    <View className="flex-1 bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Header */}
      <View className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 pt-12 pb-8 px-6 rounded-b-[40px] shadow-2xl">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-white/80 text-base mb-1">Welcome to</Text>
            <Text className="text-4xl font-bold text-white">Lost & Found</Text>
          </View>
          <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center">
            <QrCode size={32} color="#ffffff" />
          </View>
        </View>
        <Text className="text-blue-100 text-base leading-6">
          Smart QR solution to protect your belongings
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View className="mt-6 mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">Quick Stats</Text>
          <View className="flex-row gap-3">
            {stats.map((stat, index) => (
              <View
                key={index}
                className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <View
                  className={`w-10 h-10 ${stat.color} rounded-xl items-center justify-center mb-2`}
                >
                  <stat.icon size={20} color="#ffffff" />
                </View>
                <Text className="text-gray-900 text-2xl font-bold mb-1">{stat.value}</Text>
                <Text className="text-gray-500 text-xs">{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features Section */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">Features</Text>

          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate(feature.action)}
              className="mb-4"
            >
              <View
                className={`bg-gradient-to-r ${feature.color} rounded-3xl shadow-xl overflow-hidden`}
              >
                <View className="p-6 flex-row items-center">
                  <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mr-4">
                    <feature.icon size={32} color="#ffffff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-xl font-bold mb-1">{feature.title}</Text>
                    <Text className="text-white/90 text-sm leading-5">{feature.description}</Text>
                  </View>
                </View>

                {/* Decorative element */}
                <View className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full" />
                <View className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Why Choose Us Section */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-800 mb-4">Why Choose Us</Text>

          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            {[
              { icon: Shield, title: 'Secure & Private', desc: 'End-to-end encryption' },
              { icon: Zap, title: 'Lightning Fast', desc: 'Instant QR code generation' },
              { icon: QrCode, title: 'Easy to Use', desc: 'Simple and intuitive interface' },
            ].map((item, index) => (
              <View
                key={index}
                className={`flex-row items-center ${index < 2 ? 'mb-4 pb-4 border-b border-gray-100' : ''}`}
              >
                <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mr-4">
                  <item.icon size={24} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-base mb-1">{item.title}</Text>
                  <Text className="text-gray-500 text-sm">{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
