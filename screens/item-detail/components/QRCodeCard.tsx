/**
 * QR Code Card Component
 * Card hiển thị và cho phép tải QR code của item
 */

import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import QRCode from 'react-native-qrcode-svg';
import { Download } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';

interface QRCodeCardProps {
  itemId: string;
  itemName: string;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({ itemId, itemName }) => {
  const qrCodeRef = React.useRef<ViewShot>(null);

  const handleDownloadQR = async () => {
    try {
      if (!qrCodeRef.current) return;

      // Capture QR code as image
      const uri = await qrCodeRef.current.capture?.();

      if (!uri) {
        Alert.alert('Lỗi', 'Không thể tạo mã QR');
        return;
      }

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        Alert.alert('Lỗi', 'Thiết bị không hỗ trợ chia sẻ file');
        return;
      }

      // Share the QR code
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: `Lưu mã QR - ${itemName}`,
      });

      Alert.alert('Thành công', 'Đã lưu mã QR');
    } catch (error) {
      console.error('Error downloading QR:', error);
      Alert.alert('Lỗi', 'Không thể lưu mã QR');
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(100)}
      className="bg-white rounded-2xl p-6 mb-4 shadow-sm items-center"
    >
      <Text className="text-base font-semibold text-gray-900 mb-4">Mã QR của món đồ</Text>

      {/* QR Code */}
      <ViewShot ref={qrCodeRef} options={{ format: 'png', quality: 1.0 }}>
        <View className="bg-white p-4 rounded-2xl border-2 border-gray-200">
          <QRCode value={itemId} size={200} backgroundColor="white" color="#3b82f6" />
        </View>
      </ViewShot>

      <Text className="text-sm text-gray-500 mt-4 mb-4">ID: {itemId}</Text>

      {/* Download Button */}
      <TouchableOpacity
        onPress={handleDownloadQR}
        className="flex-row items-center gap-2 bg-blue-50 px-6 py-3 rounded-xl active:bg-blue-100"
      >
        <Download size={20} color="#3b82f6" />
        <Text className="text-blue-600 font-semibold">Lưu mã QR</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
