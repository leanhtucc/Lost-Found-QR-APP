/**
 * Shared scan processing pipeline for camera, gallery, and manual input.
 * It validates and deduplicates QR identities before opening the public item route.
 */
import { useState, useCallback, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { normalizeScanPayload } from '../utils/scanPayload';

export type ScannerStatus = 'idle' | 'tracking' | 'locked' | 'processing' | 'error';
export interface ScanResult {
  qrCodeId: string;
}
export type ScanSource = 'camera' | 'gallery' | 'manual';

interface UseScanProcessorReturn {
  status: ScannerStatus;
  error: string | null;
  scannedData: string | null;
  isProcessing: boolean;
  processRawValue: (raw: string, source: ScanSource) => boolean;
  reset: () => void;
}
const DEDUPE_WINDOW_MS = 2000;

export const useScanProcessor = (
  onScanSuccess: (result: ScanResult) => void
): UseScanProcessorReturn => {
  const [status, setStatus] = useState<ScannerStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const processingRef = useRef(false);
  const lastProcessedValue = useRef<string | null>(null);
  const lastProcessedAt = useRef(0);

  const processRawValue = useCallback(
    (raw: string, _source: ScanSource): boolean => {
      if (processingRef.current) return false;
      const result = normalizeScanPayload(raw);
      if (!result.success) {
        setError(result.error);
        setStatus('error');
        return false;
      }

      const { qrCodeId } = result;
      const now = Date.now();
      if (
        lastProcessedValue.current === qrCodeId &&
        now - lastProcessedAt.current < DEDUPE_WINDOW_MS
      )
        return false;

      processingRef.current = true;
      lastProcessedValue.current = qrCodeId;
      lastProcessedAt.current = now;
      setStatus('processing');
      setScannedData(qrCodeId);
      setError(null);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => onScanSuccess({ qrCodeId }), 300);
      return true;
    },
    [onScanSuccess]
  );

  const reset = useCallback(() => {
    processingRef.current = false;
    lastProcessedValue.current = null;
    lastProcessedAt.current = 0;
    setStatus('idle');
    setError(null);
    setScannedData(null);
  }, []);

  return {
    status,
    error,
    scannedData,
    isProcessing: status === 'processing',
    processRawValue,
    reset,
  };
};
