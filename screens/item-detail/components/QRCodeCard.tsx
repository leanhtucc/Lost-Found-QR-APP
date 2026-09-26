/**
 * QR Code Card Component
 * Card hiển thị và cho phép tải QR code của item
 */

import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import QRCode from 'react-native-qrcode-svg';
import { Share2 } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import { FIND_BACK } from '@constants/theme';

interface QRCodeCardProps {
  itemId: string;
  itemName: string;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({ itemId, itemName }) => {
  const qrCodeRef = React.useRef<ViewShot>(null);

  const handleShareQR = async () => {
    try {
      if (!qrCodeRef.current) return;

      // Capture QR code as image
      const uri = await qrCodeRef.current.capture?.();

      if (!uri) {
        Alert.alert('Lỗi', 'Không thể tạo ảnh mã QR');
        return;
      }

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        Alert.alert('Lỗi', 'Thiết bị không hỗ trợ chia sẻ hình ảnh');
        return;
      }

      // Share the QR code (user can save to photos, send via Zalo, AirDrop, etc.)
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: `Chia sẻ mã QR - ${itemName}`,
      });
    } catch (error) {
      console.error('Error sharing QR:', error);
      Alert.alert('Lỗi', 'Không thể chia sẻ mã QR');
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(100)}
      className="mb-4 items-center rounded-3xl border border-fb-border-subtle bg-fb-surface p-6"
    >
      <Text className="text-lg font-bold text-fb-content">Mã QR bảo vệ</Text>
      <Text className="mb-5 mt-1 text-center text-xs leading-5 text-fb-muted">
        Dán mã này lên món đồ để người nhặt có thể liên hệ an toàn.
      </Text>

      {/* QR Code */}
      <ViewShot ref={qrCodeRef} options={{ format: 'png', quality: 1.0 }}>
        <View className="rounded-3xl border-4 border-white bg-white p-4">
          <QRCode value={itemId} size={200} backgroundColor="#FFFFFF" color={FIND_BACK.neutral} />
        </View>
      </ViewShot>

      {/* Share Button */}
      <TouchableOpacity
        onPress={handleShareQR}
        accessibilityRole="button"
        accessibilityLabel="Chia sẻ mã QR"
        className="mt-5 min-h-12 flex-row items-center gap-2 rounded-2xl border border-fb-primary/25 bg-fb-primary/10 px-6 py-3"
      >
        <Share2 size={18} color={FIND_BACK.primaryLight} />
        <Text className="font-semibold text-fb-primary-light">Chia sẻ mã QR</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
