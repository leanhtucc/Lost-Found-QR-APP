import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Package, QrCode, MapPin, Calendar, MoreVertical, Search, Plus } from 'lucide-react-native';

const MOCK_ITEMS = [
  {
    id: '1',
    name: 'Black Backpack',
    description: 'North Face backpack with laptop compartment',
    location: 'Office',
    registeredDate: '2026-01-15',
    status: 'active',
  },
  {
    id: '2',
    name: 'iPhone 13 Pro',
    description: 'Blue iPhone with black case',
    location: 'Home',
    registeredDate: '2026-01-10',
    status: 'active',
  },
  {
    id: '3',
    name: 'Car Keys',
    description: 'Toyota keys with blue keychain',
    location: 'Car',
    registeredDate: '2026-01-05',
    status: 'active',
  },
];

export const MyItemsScreen = () => {
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gradient-to-r from-purple-600 to-indigo-600 pt-12 pb-6 px-6 rounded-b-3xl shadow-lg">
        <Text className="text-3xl font-bold text-white mb-2">My Items</Text>
        <Text className="text-purple-100 text-base">
          {MOCK_ITEMS.length} items registered
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {/* Search Bar */}
        <View className="bg-white rounded-2xl shadow-sm mb-6 flex-row items-center px-4 py-3">
          <Search size={20} color="#9ca3af" />
          <Text className="flex-1 ml-3 text-gray-400 text-base">
            Search your items...
          </Text>
        </View>

        {/* Stats Cards */}
        <View className="flex-row mb-6 gap-3">
          <View className="flex-1 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 shadow-lg">
            <View className="flex-row items-center justify-between mb-2">
              <Package size={24} color="#ffffff" />
              <View className="bg-white/20 rounded-full px-2 py-1">
                <Text className="text-white text-xs font-bold">Active</Text>
              </View>
            </View>
            <Text className="text-white text-3xl font-bold mb-1">{MOCK_ITEMS.length}</Text>
            <Text className="text-blue-100 text-sm">Total Items</Text>
          </View>

          <View className="flex-1 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 shadow-lg">
            <View className="flex-row items-center justify-between mb-2">
              <QrCode size={24} color="#ffffff" />
              <View className="bg-white/20 rounded-full px-2 py-1">
                <Text className="text-white text-xs font-bold">0</Text>
              </View>
            </View>
            <Text className="text-white text-3xl font-bold mb-1">0</Text>
            <Text className="green-100 text-sm">Scans Today</Text>
          </View>
        </View>

        {/* Items List */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-800">Registered Items</Text>
            <TouchableOpacity className="bg-purple-600 rounded-full p-2">
              <Plus size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {MOCK_ITEMS.map((item, index) => (
            <View
              key={item.id}
              className="bg-white rounded-2xl shadow-sm mb-3 overflow-hidden border border-gray-100"
            >
              {/* Item Header */}
              <View className="p-4 pb-3">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <View className="w-10 h-10 bg-purple-100 rounded-xl items-center justify-center mr-3">
                        <Package size={20} color="#9333ea" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 font-bold text-lg">
                          {item.name}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          {item.description}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity className="p-2">
                    <MoreVertical size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                {/* Item Details */}
                <View className="flex-row items-center mb-2">
                  <MapPin size={16} color="#9ca3af" />
                  <Text className="text-gray-600 text-sm ml-2">{item.location}</Text>
                </View>

                <View className="flex-row items-center mb-3">
                  <Calendar size={16} color="#9ca3af" />
                  <Text className="text-gray-600 text-sm ml-2">
                    Registered: {new Date(item.registeredDate).toLocaleDateString()}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-2">
                  <TouchableOpacity className="flex-1 bg-purple-50 py-2.5 rounded-xl flex-row items-center justify-center">
                    <QrCode size={18} color="#9333ea" />
                    <Text className="text-purple-700 font-semibold ml-2 text-sm">
                      View QR
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity className="flex-1 bg-gray-100 py-2.5 rounded-xl flex-row items-center justify-center">
                    <Package size={18} color="#6b7280" />
                    <Text className="text-gray-700 font-semibold ml-2 text-sm">
                      Details
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Status Bar */}
              <View className="bg-green-50 px-4 py-2 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <Text className="text-green-700 text-sm font-semibold">Active</Text>
                </View>
                <Text className="text-green-600 text-xs">0 scans</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Empty State (if no items) */}
        {/* <View className="flex-1 items-center justify-center py-12">
          <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Package size={48} color="#9ca3af" />
          </View>
          <Text className="text-gray-600 text-lg font-semibold mb-2">No items yet</Text>
          <Text className="text-gray-400 text-sm text-center mb-6">
            Register your first item to get started
          </Text>
          <TouchableOpacity className="bg-purple-600 px-6 py-3 rounded-xl">
            <Text className="text-white font-bold">Add First Item</Text>
          </TouchableOpacity>
        </View> */}
      </ScrollView>
    </View>
  );
};
