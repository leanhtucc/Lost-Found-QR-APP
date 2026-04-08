/**
 * useQRScanner Hook
 * Custom hook xử lý logic scan QR code với support cho memberId
 */

import { useState, useCallback, useRef } from 'react';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import * as Haptics from 'expo-haptics';
import { itemsApi } from '@/services/items';
import type { ScanItemResponse } from '@/types/item';

interface ScanResult {
  itemId: string;
  scanData?: ScanItemResponse;
  isOwnItem: boolean;
}

interface UseQRScannerReturn {
  device: any;
  hasPermission: boolean;
  isScanning: boolean;
  hasCodeInFrame: boolean;
  error: string | null;
  scannedData: string | null;
  requestPermission: () => Promise<void>;
  handleCodeScanned: (codes: any[]) => void;
  resetScanner: () => void;
}

export const useQRScanner = (onScanSuccess: (result: ScanResult) => void): UseQRScannerReturn => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCodeInFrame, setHasCodeInFrame] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const hasScanned = useRef(false);
  const codeDetectionTimeout = useRef<NodeJS.Timeout | null>(null);

  const device = useCameraDevice('back');

  // Request camera permission
  const requestPermission = useCallback(async () => {
    try {
      const permission = await Camera.requestCameraPermission();

      if (permission === 'granted' || (permission as string) === 'authorized') {
        setHasPermission(true);
        setError(null);
      } else {
        setHasPermission(false);
        setError('Quyền truy cập camera bị từ chối. Vui lòng cấp quyền trong cài đặt.');
      }
    } catch (err) {
      console.error('Permission error:', err);
      setError('Không thể yêu cầu quyền camera');
    }
  }, []);

  // Record scan event to backend
  const recordScanEvent = useCallback(async (itemId: string) => {
    try {
      // TODO: Call API to record scan event
      console.log('Scan event recorded for item:', itemId);
    } catch (err) {
      console.error('Error recording scan:', err);
    }
  }, []);

  // Fetch scan data and determine navigation
  const fetchScanData = useCallback(
    async (itemId: string) => {
      try {
        // TODO: Call actual scan API endpoint: /api/scan/:itemId
        // For now, we'll use getItemById and check ownership
        await itemsApi.getItemById(itemId);

        // Record scan event
        await recordScanEvent(itemId);

        // Determine if this is user's own item
        // This should ideally be done by comparing user.memberId with item.ownerId
        // But for now, we assume if we can fetch it, it's our item
        const isOwnItem = true; // TODO: Compare with current user's memberId

        // Notify parent with result
        setTimeout(() => {
          onScanSuccess({
            itemId,
            isOwnItem,
            // scanData will be populated by actual scan API
          });
        }, 500);
      } catch (err) {
        console.error('Error fetching scan data:', err);
        // On error, treat as own item and navigate to ItemDetails
        setTimeout(() => {
          onScanSuccess({
            itemId,
            isOwnItem: true,
          });
        }, 500);
      }
    },
    [recordScanEvent, onScanSuccess]
  );

  // Handle scanned QR code
  const handleCodeScanned = useCallback(
    (codes: any[]) => {
      // Clear previous timeout
      if (codeDetectionTimeout.current) {
        clearTimeout(codeDetectionTimeout.current);
      }

      // Show scanning line when code is in frame
      if (codes.length > 0 && codes[0]?.value) {
        setHasCodeInFrame(true);

        // Hide scanning line after 300ms of no detection
        codeDetectionTimeout.current = setTimeout(() => {
          setHasCodeInFrame(false);
        }, 300);
      } else {
        setHasCodeInFrame(false);
      }

      // Process scan only once
      if (hasScanned.current || codes.length === 0) return;

      const code = codes[0];
      if (!code?.value) return;

      hasScanned.current = true;
      setIsScanning(true);

      // Haptic feedback on successful scan
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const decodedText = code.value;
      console.log('QR Code scanned:', decodedText);

      // Extract item ID from QR code
      let itemId = decodedText;

      // Handle deep link format: lostfound://item/{id}
      if (decodedText.includes('lostfound://item/')) {
        itemId = decodedText.replace('lostfound://item/', '');
      }
      // Handle old format
      else if (decodedText.includes('lostfoundqr://item/')) {
        itemId = decodedText.replace('lostfoundqr://item/', '');
      }
      // Handle URL format
      else if (decodedText.includes('/item/')) {
        const parts = decodedText.split('/item/');
        itemId = parts[parts.length - 1];
      }

      setScannedData(itemId);

      // Fetch scan data from API to determine if it's user's own item
      fetchScanData(itemId);
    },
    [fetchScanData]
  );

  // Reset scanner state
  const resetScanner = useCallback(() => {
    hasScanned.current = false;
    setIsScanning(false);
    setHasCodeInFrame(false);
    setScannedData(null);
    setError(null);
    if (codeDetectionTimeout.current) {
      clearTimeout(codeDetectionTimeout.current);
    }
  }, []);

  return {
    device,
    hasPermission,
    isScanning,
    hasCodeInFrame,
    error,
    scannedData,
    requestPermission,
    handleCodeScanned,
    resetScanner,
  };
};
