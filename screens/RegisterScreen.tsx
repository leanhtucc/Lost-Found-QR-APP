import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Package, Tag, MapPin, Upload, CheckCircle2 } from 'lucide-react-native';

export const RegisterScreen = () => {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gradient-to-r from-green-600 to-emerald-600 pt-12 pb-6 px-6 rounded-b-3xl shadow-lg">
        <Text className="text-3xl font-bold text-white mb-2">Register Item</Text>
        <Text className="text-green-100 text-base">Add your belongings to keep them safe</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {/* Form Card */}
        <View className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-6">Item Details</Text>

          {/* Item Name Input */}
          <View className="mb-5">
            <View className="flex-row items-center mb-2">
              <Package size={20} color="#059669" />
              <Text className="text-gray-700 font-semibold ml-2 text-base">Item Name *</Text>
            </View>
            <TextInput
              value={itemName}
              onChangeText={setItemName}
              placeholder="e.g., Black Backpack, iPhone 13 Pro"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-base"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Description Input */}
          <View className="mb-5">
            <View className="flex-row items-center mb-2">
              <Tag size={20} color="#059669" />
              <Text className="text-gray-700 font-semibold ml-2 text-base">Description *</Text>
            </View>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your item in detail..."
              multiline
              numberOfLines={4}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-base"
              placeholderTextColor="#9ca3af"
              style={{ textAlignVertical: 'top' }}
            />
          </View>

          {/* Location Input */}
          <View className="mb-5">
            <View className="flex-row items-center mb-2">
              <MapPin size={20} color="#059669" />
              <Text className="text-gray-700 font-semibold ml-2 text-base">Usual Location</Text>
            </View>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Where do you usually keep this item?"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-base"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Upload Photo Section */}
          <View className="mb-5">
            <View className="flex-row items-center mb-3">
              <Upload size={20} color="#059669" />
              <Text className="text-gray-700 font-semibold ml-2 text-base">
                Item Photo (Optional)
              </Text>
            </View>

            <TouchableOpacity className="border-2 border-dashed border-gray-300 rounded-xl p-8 items-center bg-gray-50">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-3">
                <Upload size={28} color="#059669" />
              </View>
              <Text className="text-gray-600 font-semibold mb-1">Upload a photo</Text>
              <Text className="text-gray-400 text-sm">PNG, JPG up to 10MB</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* QR Code Preview */}
        <View className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">Your QR Code</Text>

          <View className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 items-center">
            <View className="w-48 h-48 bg-white rounded-2xl shadow-lg items-center justify-center mb-4">
              <View className="w-40 h-40 bg-gray-900 rounded-xl" />
            </View>
            <Text className="text-gray-600 text-sm text-center">
              QR code will be generated after registration
            </Text>
          </View>
        </View>

        {/* Register Button */}
        <TouchableOpacity className="bg-gradient-to-r from-green-600 to-emerald-600 py-4 rounded-2xl shadow-xl mb-6">
          <View className="flex-row items-center justify-center">
            <CheckCircle2 size={24} color="#ffffff" />
            <Text className="text-white text-lg font-bold ml-3">Register Item</Text>
          </View>
        </TouchableOpacity>

        {/* Info */}
        <View className="bg-green-50 rounded-xl p-4 mb-8 border-l-4 border-green-500">
          <Text className="text-green-900 font-bold mb-1">Privacy Note</Text>
          <Text className="text-green-700 text-sm leading-5">
            Your information is encrypted and only shared when someone scans your QR code.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};
