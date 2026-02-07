/**
 * Scanner Instructions Component
 * Hiển thị hướng dẫn và trạng thái scan
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Camera, QrCode, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ScannerInstructionsProps {
  isScanning: boolean;
  scannedData: string | null;
}

export const ScannerInstructions: React.FC<ScannerInstructionsProps> = ({
  isScanning,
  scannedData,
}) => {
  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(200)}
      className="absolute bottom-24 left-0 right-0 items-center px-8"
    >
      {scannedData ? (
        // Success State with gradient
        <Animated.View entering={FadeInDown.duration(300)}>
          <LinearGradient
            colors={['#10b981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.successContainer}
          >
            <View className="flex-row items-center mb-2">
              <CheckCircle size={24} color="#ffffff" strokeWidth={2.5} />
              <Text style={styles.successTitle}>Quét thành công!</Text>
            </View>
            <Text style={styles.successSubtitle}>Đang tải thông tin vật phẩm...</Text>
          </LinearGradient>
        </Animated.View>
      ) : (
        // Normal State with improved design
        <View className="items-center">
          {/* Main instruction card */}
          <View style={styles.instructionCard}>
            <View className="flex-row items-center mb-3">
              <QrCode size={24} color="#ffffff" strokeWidth={2} />
              <Text style={styles.instructionTitle}>Quét mã QR</Text>
            </View>
            <Text style={styles.instructionText}>Đưa mã QR vào trong khung hình vuông</Text>
            <Text style={styles.statusText}>
              {isScanning ? '🔍 Đang quét...' : '📷 Chuẩn bị camera...'}
            </Text>
          </View>

          {/* Camera Icon Indicator with gradient */}
          <Animated.View entering={FadeInUp.duration(500).delay(400)} className="mt-4">
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cameraIcon}
            >
              <Camera size={28} color="#ffffff" strokeWidth={2.5} />
            </LinearGradient>
          </Animated.View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  successContainer: {
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  successSubtitle: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  instructionCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  instructionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  instructionText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  statusText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  cameraIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
