/**
 * Scan Screen
 * Màn hình quét QR code với camera, thư viện ảnh, và nhập mã thủ công.
 * Sử dụng react-native-vision-camera để scan QR code.
 * Supports professional Lost & Found with memberId.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StatusBar, BackHandler, Alert } from 'react-native';

import { useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';

import { useQRScanner } from './hooks/useQRScanner';
import { useScanProcessor } from './hooks/useScanProcessor';
import { useImageQRScanner } from './hooks/useImageQRScanner';
import type { ScanResult } from './hooks/useScanProcessor';

import {
  ScannerHeader,
  ScannerView,
  ScannerOverlay,
  ScannerInstructions,
  ScannerError,
  ScannerLoading,
  ScannerActions,
  ManualInputModal,
} from './components';
import { FIND_BACK } from '@constants/theme';

type ScanNavigationProp = StackNavigationProp<RootStackParamList>;

export const ScanScreen: React.FC = () => {
  const navigation = useNavigation<ScanNavigationProp>();
  const isFocused = useIsFocused();
  const isFocusedRef = useRef(isFocused);
  useEffect(() => {
    isFocusedRef.current = isFocused;
  }, [isFocused]);

  const [isInitialized, setIsInitialized] = useState(false);
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  // ── Shared scan processor ─────────────────────────────────────

  const handleScanSuccess = useCallback(
    (result: ScanResult) => {
      // Prevent stale navigation if the screen blurred while scan request was in flight
      if (!isFocusedRef.current) {
        console.log('Screen blurred before scan completed, ignoring navigation');
        return;
      }

      console.log('Scan result:', result);
      const rootNavigation = navigation.getParent<ScanNavigationProp>() ?? navigation;

      if (result.action === 'open_chat') {
        if (result.channelId) {
          rootNavigation.navigate('Chat', {
            channelId: result.channelId,
            itemName: result.itemName || 'Vật dụng',
            userName: result.ownerDisplayName || 'Chủ sở hữu',
          });
          return;
        }

        Alert.alert(
          'Không thể mở cuộc trò chuyện',
          'Đã quét thành công nhưng chưa nhận được kênh chat từ hệ thống. Vui lòng thử lại sau.'
        );
        rootNavigation.navigate('ItemDetails', { itemId: result.itemId });
        return;
      }

      // Default: info_only or unknown response
      rootNavigation.navigate('ItemDetails', { itemId: result.itemId });
    },
    [navigation]
  );

  const {
    status,
    error: processorError,
    scannedData,
    isProcessing,
    processRawValue,
    reset: resetProcessor,
  } = useScanProcessor(handleScanSuccess);

  // ── Camera QR scanner ─────────────────────────────────────────

  const handleCameraCodeDetected = useCallback(
    (value: string) => {
      processRawValue(value, 'camera');
    },
    [processRawValue]
  );

  const {
    device,
    hasPermission,
    qrBounds,
    error: cameraError,
    requestPermission,
    handleCodeScanned,
    setPreviewLayout,
    resetScanner,
  } = useQRScanner(handleCameraCodeDetected, status);

  // ── Gallery QR scanner ────────────────────────────────────────

  const handleGalleryCodeDetected = useCallback(
    (value: string) => {
      processRawValue(value, 'gallery');
    },
    [processRawValue]
  );

  const {
    isLoading: isGalleryLoading,
    error: galleryError,
    pickAndScanImage,
    clearError: clearGalleryError,
  } = useImageQRScanner(handleGalleryCodeDetected);

  // ── Manual input handler ──────────────────────────────────────

  const handleManualSubmit = useCallback(
    (value: string) => {
      setManualError(null);
      const accepted = processRawValue(value, 'manual');
      // Close the modal only once the shared processor accepts the value.
      // On a validation error it stays open and the error surfaces via
      // `processorError` passed to the modal below.
      if (accepted) {
        setManualModalVisible(false);
      }
    },
    [processRawValue]
  );

  // ── Initialize camera ─────────────────────────────────────────

  useEffect(() => {
    const initCamera = async () => {
      await requestPermission();
      setIsInitialized(true);
    };

    initCamera();
  }, [requestPermission]);

  // ── Reset on screen focus/blur ────────────────────────────────
  useEffect(() => {
    if (isFocused) {
      resetProcessor();
      resetScanner();
      clearGalleryError();
      setManualError(null);
    } else {
      // Screen blurred / unfocused: immediately clear transient scanner state
      resetScanner();
      clearGalleryError();
      setManualError(null);
    }
  }, [isFocused, resetProcessor, resetScanner, clearGalleryError]);

  // ── Handle close ──────────────────────────────────────────────

  const handleClose = useCallback(() => {
    if (isProcessing) {
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
  }, [isProcessing, navigation]);

  // ── Handle back button ────────────────────────────────────────

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });

    return () => backHandler.remove();
  }, [handleClose]);

  // ── Handle retry after error ──────────────────────────────────

  const handleRetry = async () => {
    resetProcessor();
    resetScanner();
    clearGalleryError();
    setManualError(null);
    await requestPermission();
  };

  // ── Gallery button handler ────────────────────────────────────

  const handleGalleryPress = useCallback(() => {
    if (isProcessing) return;
    pickAndScanImage();
  }, [isProcessing, pickAndScanImage]);

  // ── Manual input button handler ───────────────────────────────

  const handleManualPress = useCallback(() => {
    if (isProcessing) return;
    setManualError(null);
    setManualModalVisible(true);
  }, [isProcessing]);

  // ── Center "Quét" button: recenter scan UI / re-request permission ──

  const handleScanPress = useCallback(async () => {
    if (isProcessing) return;
    resetProcessor();
    resetScanner();
    clearGalleryError();
    setManualError(null);
    if (!hasPermission) {
      await requestPermission();
    }
  }, [
    isProcessing,
    hasPermission,
    resetProcessor,
    resetScanner,
    clearGalleryError,
    requestPermission,
  ]);

  // ── Determine error state ─────────────────────────────────────

  // Camera-level problem (permission denied / device unavailable). This blocks
  // the camera preview but must NOT hide Gallery / Manual actions.
  const cameraUnavailable = Boolean(cameraError) || !hasPermission || !device;
  // Transient per-scan errors (invalid payload, network, gallery decode).
  const scanError = processorError || galleryError;
  const displayError = cameraError || scanError;
  const isPermissionError =
    Boolean(cameraError) && (cameraError?.includes('quyền') || cameraError?.includes('permission'));

  // Camera preview is usable only with permission + a device.
  const cameraReady = hasPermission && !!device && isInitialized;

  // Effective status for UI: promote idle→tracking while a QR is in frame,
  // but never mask processing / error states.
  const effectiveStatus = status === 'idle' && qrBounds ? 'tracking' : status;

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor={FIND_BACK.neutral} />

      {/* Camera View */}
      {cameraReady ? (
        <ScannerView
          device={device}
          isActive={isFocused && !scannedData && !scanError}
          onCodeScanned={handleCodeScanned}
          onLayoutChange={setPreviewLayout}
        />
      ) : null}

      {/* Scanner Overlay — animated tracking frame */}
      {cameraReady && !scanError && <ScannerOverlay status={effectiveStatus} qrBounds={qrBounds} />}

      {/* Header */}
      <ScannerHeader onClose={handleClose} />

      {/* Instructions */}
      {cameraReady && !scanError && (
        <ScannerInstructions status={effectiveStatus} scannedData={scannedData} />
      )}

      {/* Error State — camera permission or transient scan error.
          Rendered BEFORE the action bar so the bar stays tappable on top. */}
      {displayError && !isGalleryLoading && (
        <ScannerError
          error={displayError}
          onRetry={handleRetry}
          isPermissionError={isPermissionError}
        />
      )}

      {/* Camera-unavailable notice when there is no explicit error string yet */}
      {isInitialized && cameraUnavailable && !displayError && (
        <ScannerError
          error="Không thể sử dụng camera. Bạn vẫn có thể quét từ thư viện hoặc nhập mã."
          onRetry={handleRetry}
          isPermissionError={false}
        />
      )}

      {/* Action Bar: Gallery / Scan / Manual.
          Always available once initialized — Gallery & Manual work even when
          the camera is unavailable (permission denied). */}
      {isInitialized && (
        <ScannerActions
          onGalleryPress={handleGalleryPress}
          onManualPress={handleManualPress}
          onScanPress={handleScanPress}
          status={effectiveStatus}
        />
      )}

      {/* Loading State */}
      {!isInitialized && <ScannerLoading />}

      {/* Manual Input Modal */}
      <ManualInputModal
        visible={manualModalVisible}
        onClose={() => setManualModalVisible(false)}
        onSubmit={handleManualSubmit}
        isProcessing={isProcessing}
        error={manualError || processorError}
      />
    </View>
  );
};

export default ScanScreen;
