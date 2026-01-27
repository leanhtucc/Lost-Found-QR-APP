import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { QrCode, Camera, Flashlight, AlertCircle } from 'lucide-react-native';

export const ScanScreen = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);

  const handleScan = () => {
    setIsScanning(!isScanning);
  };

  return (
    <View className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <View className="bg-blue-600 pt-12 pb-6 px-6 rounded-b-3xl shadow-lg">
        <Text className="text-3xl font-bold text-white mb-2">Scan QR Code</Text>
        <Text className="text-blue-100 text-base">Point your camera at a QR code to scan</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {/* Scanner Area */}
        <View className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          <View className="aspect-square bg-gray-900 items-center justify-center relative">
            {!isScanning ? (
              <View className="items-center">
                <QrCode size={120} color="#ffffff" strokeWidth={1.5} />
                <Text className="text-white text-lg mt-4 font-semibold">Tap to start scanning</Text>
              </View>
            ) : (
              <View className="items-center">
                <View className="w-64 h-64 border-4 border-blue-500 rounded-2xl relative">
                  {/* Corner indicators */}
                  <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400" />
                  <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400" />
                  <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400" />
                  <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400" />

                  {/* Scanning line animation placeholder */}
                  <View className="absolute top-1/2 left-0 right-0 h-1 bg-blue-400 opacity-70" />
                </View>
                <Text className="text-white text-lg mt-6 font-semibold animate-pulse">
                  Scanning...
                </Text>
              </View>
            )}
          </View>

          {/* Flash Control */}
          <View className="p-4 bg-gray-50 flex-row justify-center">
            <TouchableOpacity
              onPress={() => setFlashEnabled(!flashEnabled)}
              className={`flex-row items-center px-6 py-3 rounded-full ${
                flashEnabled ? 'bg-yellow-500' : 'bg-gray-300'
              }`}
            >
              <Flashlight
                size={20}
                color={flashEnabled ? '#ffffff' : '#666666'}
                fill={flashEnabled ? '#ffffff' : 'none'}
              />
              <Text
                className={`ml-2 font-semibold ${flashEnabled ? 'text-white' : 'text-gray-700'}`}
              >
                {flashEnabled ? 'Flash On' : 'Flash Off'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scan Button */}
        <TouchableOpacity
          onPress={handleScan}
          className={`py-4 rounded-2xl shadow-lg mb-6 ${isScanning ? 'bg-red-500' : 'bg-blue-600'}`}
        >
          <View className="flex-row items-center justify-center">
            <Camera size={24} color="#ffffff" />
            <Text className="text-white text-lg font-bold ml-3">
              {isScanning ? 'Stop Scanning' : 'Start Scanning'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Info Card */}
        <View className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-4 mb-6 flex-row">
          <AlertCircle size={24} color="#2563eb" className="mr-3" />
          <View className="flex-1">
            <Text className="text-blue-900 font-bold text-base mb-1">How to scan</Text>
            <Text className="text-blue-700 text-sm leading-5">
              Position the QR code within the frame. The scanner will automatically detect and
              process it.
            </Text>
          </View>
        </View>

        {/* Recent Scans */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">Recent Scans</Text>

          {[1, 2, 3].map(item => (
            <TouchableOpacity
              key={item}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100 flex-row items-center"
            >
              <View className="w-12 h-12 bg-blue-100 rounded-xl items-center justify-center mr-4">
                <QrCode size={24} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold text-base">Item #{item}2345</Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Scanned {item} hour{item > 1 ? 's' : ''} ago
                </Text>
              </View>
              <View className="w-2 h-2 bg-green-500 rounded-full" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
