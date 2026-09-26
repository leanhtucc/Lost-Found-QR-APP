/**
 * useImageQRScanner Hook
 * Chọn ảnh từ thư viện và decode QR code bằng rn-qr-generator.
 */

import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import RNQRGenerator from 'rn-qr-generator';
import { normalizeScanPayload } from '../utils/scanPayload';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface UseImageQRScannerReturn {
  isLoading: boolean;
  error: string | null;
  /** Pick an image from gallery and scan for QR codes */
  pickAndScanImage: () => Promise<void>;
  clearError: () => void;
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

export const useImageQRScanner = (
  /** Called with the raw QR value when a valid QR is found */
  onQRDetected: (value: string) => void
): UseImageQRScannerReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const pickAndScanImage = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      // ── 1. Pick image ─────────────────────────────────────────
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        // User cancelled — not an error
        setIsLoading(false);
        return;
      }

      const imageUri = result.assets[0].uri;

      // ── 2. Detect QR codes from image (native) ────────────────
      const qrResult = await RNQRGenerator.detect({ uri: imageUri });

      if (!qrResult.values || qrResult.values.length === 0) {
        setError('Không tìm thấy mã QR trong ảnh.');
        setIsLoading(false);
        return;
      }

      // ── 3. Filter to valid FindBack QR payloads ───────────────
      const validPayloads: { raw: string; itemId: string }[] = [];
      for (const rawValue of qrResult.values) {
        const normalized = normalizeScanPayload(rawValue);
        if (normalized.success) {
          validPayloads.push({ raw: rawValue, itemId: normalized.itemId });
        }
      }

      if (validPayloads.length === 0) {
        setError('Không tìm thấy mã QR hợp lệ trong ảnh.');
        setIsLoading(false);
        return;
      }

      if (validPayloads.length > 1) {
        // Multiple distinct valid QR codes — require user to isolate
        const uniqueIds = new Set(validPayloads.map(p => p.itemId));
        if (uniqueIds.size > 1) {
          setError('Ảnh chứa nhiều mã QR. Vui lòng chọn ảnh chỉ có một mã cần quét.');
          setIsLoading(false);
          return;
        }
      }

      // ── 4. Process the single valid payload ───────────────────
      onQRDetected(validPayloads[0].raw);
    } catch (err) {
      console.error('Image QR scan error:', err);
      setError('Không thể quét mã QR từ ảnh. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [onQRDetected]);

  return {
    isLoading,
    error,
    pickAndScanImage,
    clearError,
  };
};
