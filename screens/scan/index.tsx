/**
 * Scan Screen
 * Màn hình quét QR code với camera
 * Sử dụng react-native-vision-camera để scan QR code
 */

import React, { useEffect, useState } from 'react';
import { View, StatusBar, BackHandler, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';
import { useQRScanner } from './hooks/useQRScanner';
import {
  ScannerHeader,
  ScannerView,
  ScannerOverlay,
  ScannerInstructions,
  ScannerError,
  ScannerLoading,
} from './components';

type ScanNavigationProp = StackNavigationProp<RootStackParamList>;

export const ScanScreen: React.FC = () => {
  const navigation = useNavigation<ScanNavigationProp>();
  const [isInitialized, setIsInitialized] = useState(false);

  // Handle successful scan
  const handleScanSuccess = (itemId: string) => {
    console.log('Navigating to item:', itemId);

    // Navigate to item detail screen
    navigation.replace('ItemDetails', { itemId });
  };

  // Use QR scanner hook
  const {
    device,
    hasPermission,
    isScanning,
    hasCodeInFrame,
    error,
    scannedData,
    requestPermission,
    handleCodeScanned,
    resetScanner,
  } = useQRScanner(handleScanSuccess);

  // Request permission on mount
  useEffect(() => {
    const initCamera = async () => {
      await requestPermission();
      setIsInitialized(true);
    };

    initCamera();
  }, [requestPermission]);

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  // Handle close
  const handleClose = () => {
    if (isScanning) {
      Alert.alert('Đang quét mã', 'Bạn có muốn dừng quét mã QR?', [
        { text: 'Tiếp tục', style: 'cancel' },
        {
          text: 'Dừng',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      navigation.goBack();
    }
  };

  // Handle retry after error
  const handleRetry = async () => {
    resetScanner();
    await requestPermission();
  };

  // Determine if permission error
  const isPermissionError = error?.includes('quyền') || error?.includes('permission');

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Camera View */}
      {hasPermission && device && isInitialized ? (
        <ScannerView
          device={device}
          isActive={!scannedData && !error}
          onCodeScanned={handleCodeScanned}
        />
      ) : null}

      {/* Scanner Overlay */}
      {hasPermission && !error && (
        <ScannerOverlay isScanning={!scannedData} hasCodeInFrame={hasCodeInFrame} />
      )}

      {/* Header */}
      <ScannerHeader onClose={handleClose} />

      {/* Instructions */}
      {hasPermission && !error && (
        <ScannerInstructions isScanning={!scannedData} scannedData={scannedData} />
      )}

      {/* Error State */}
      {error && (
        <ScannerError error={error} onRetry={handleRetry} isPermissionError={isPermissionError} />
      )}

      {/* Loading State */}
      {!isInitialized && !error && <ScannerLoading />}
    </View>
  );
};

export default ScanScreen;
