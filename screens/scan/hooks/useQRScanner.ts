/**
 * useQRScanner Hook
 * Camera QR detection with real-time position tracking.
 * Delegates scan processing to useScanProcessor.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import type { Code, CodeScannerFrame } from 'react-native-vision-camera';
import { mapCodeBoundsToPreview, selectBestCode } from '../utils/mapCodeBoundsToPreview';
import type { QRBounds, PreviewLayout } from '../utils/mapCodeBoundsToPreview';
import type { ScannerStatus } from './useScanProcessor';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface UseQRScannerReturn {
  device: ReturnType<typeof useCameraDevice>;
  hasPermission: boolean;
  /** Real-time QR bounding box in screen coordinates */
  qrBounds: QRBounds | null;
  error: string | null;
  requestPermission: () => Promise<void>;
  handleCodeScanned: (codes: Code[], frame: CodeScannerFrame) => void;
  /** Set camera preview layout from onLayout */
  setPreviewLayout: (layout: PreviewLayout) => void;
  resetScanner: () => void;
}

// ─── Detection timeout (ms) ─────────────────────────────────────────────────────

const DETECTION_TIMEOUT_MS = 400;

// ─── Hook ───────────────────────────────────────────────────────────────────────

export const useQRScanner = (
  /** Called when a valid QR code value is detected for the first time */
  onCodeDetected: (value: string) => void,
  /** Current scanner status from useScanProcessor */
  scannerStatus: ScannerStatus
): UseQRScannerReturn => {
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrBounds, setQrBounds] = useState<QRBounds | null>(null);

  const previewLayoutRef = useRef<PreviewLayout | null>(null);
  const lastDetectedAt = useRef<number>(0);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasEmittedRef = useRef(false);

  const device = useCameraDevice('back');

  // ── Camera permission ─────────────────────────────────────────

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

  // ── Preview layout ────────────────────────────────────────────

  const setPreviewLayout = useCallback((layout: PreviewLayout) => {
    previewLayoutRef.current = layout;
  }, []);

  // ── Code scanned handler ──────────────────────────────────────

  const handleCodeScanned = useCallback(
    (codes: Code[], _frame: CodeScannerFrame) => {
      // Clear previous timeout
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
        detectionTimeoutRef.current = null;
      }

      // Select best QR code
      const best = selectBestCode(codes, previewLayoutRef.current);

      if (best && best.value) {
        // ── Update tracking bounds ──────────────────────────────
        lastDetectedAt.current = Date.now();

        const bounds = mapCodeBoundsToPreview(best.frame, previewLayoutRef.current);

        if (bounds) {
          setQrBounds(bounds);
        }

        // ── Emit value for processing (once) ────────────────────
        if (!hasEmittedRef.current && scannerStatus !== 'processing') {
          hasEmittedRef.current = true;
          onCodeDetected(best.value);
        }

        // ── Set timeout to clear bounds if QR disappears ────────
        detectionTimeoutRef.current = setTimeout(() => {
          setQrBounds(null);
        }, DETECTION_TIMEOUT_MS);
      } else {
        // No valid code — set timeout to clear bounds
        detectionTimeoutRef.current = setTimeout(() => {
          const elapsed = Date.now() - lastDetectedAt.current;
          if (elapsed >= DETECTION_TIMEOUT_MS) {
            setQrBounds(null);
          }
        }, DETECTION_TIMEOUT_MS);
      }
    },
    [onCodeDetected, scannerStatus]
  );

  // ── Reset ─────────────────────────────────────────────────────

  const resetScanner = useCallback(() => {
    hasEmittedRef.current = false;
    setQrBounds(null);
    setError(null);
    lastDetectedAt.current = 0;
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
      detectionTimeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
      }
    };
  }, []);

  return {
    device,
    hasPermission,
    qrBounds,
    error,
    requestPermission,
    handleCodeScanned,
    setPreviewLayout,
    resetScanner,
  };
};
