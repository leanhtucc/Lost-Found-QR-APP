/**
 * useScanProcessor Hook
 * Shared scan processing pipeline for camera, gallery, and manual input.
 * Centralizes: normalize → validate → dedupe → lock → fetchScanData → navigate.
 */

import { useState, useCallback, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { itemsApi } from '@/services/items';
import { normalizeScanPayload } from '../utils/scanPayload';
import type { ScanItemResponse } from '@/types/item';

// ─── Types ──────────────────────────────────────────────────────────────────────

export type ScannerStatus = 'idle' | 'tracking' | 'locked' | 'processing' | 'error';

export interface ScanResult {
  itemId: string;
  scanData?: ScanItemResponse;
  isOwnItem: boolean;
  action?: ScanItemResponse['action'];
  channelId?: string;
  itemName?: string;
  ownerDisplayName?: string;
}

export type ScanSource = 'camera' | 'gallery' | 'manual';

interface UseScanProcessorReturn {
  status: ScannerStatus;
  error: string | null;
  scannedData: string | null;
  isProcessing: boolean;
  /** Process a raw scan value from any source. Returns true if accepted. */
  processRawValue: (raw: string, source: ScanSource) => boolean;
  /** Reset processor state for a fresh scan. */
  reset: () => void;
}

// ─── Dedupe config ──────────────────────────────────────────────────────────────

const DEDUPE_WINDOW_MS = 2000;

// ─── Hook ───────────────────────────────────────────────────────────────────────

export const useScanProcessor = (
  onScanSuccess: (result: ScanResult) => void
): UseScanProcessorReturn => {
  const [status, setStatus] = useState<ScannerStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);

  // Processing lock — prevents concurrent backend calls
  const processingRef = useRef(false);
  // Dedupe — prevents re-processing the same value within a short window
  const lastProcessedValue = useRef<string | null>(null);
  const lastProcessedAt = useRef<number>(0);

  const toScanResult = useCallback((itemId: string, scanData: ScanItemResponse): ScanResult => {
    const isOpenChat = scanData.action === 'open_chat';
    const ownerDisplayName = scanData.item_info.owner_info?.display_name;

    return {
      itemId,
      scanData,
      isOwnItem: !isOpenChat,
      action: scanData.action,
      channelId: scanData.action === 'open_chat' ? scanData.channelId : undefined,
      itemName: scanData.item_info.name,
      ownerDisplayName,
    };
  }, []);

  const fetchScanData = useCallback(
    async (itemId: string) => {
      try {
        const scanData = await itemsApi.scanQR(itemId);
        const result = toScanResult(itemId, scanData);

        // Small delay for UI transition
        setTimeout(() => {
          onScanSuccess(result);
        }, 500);
      } catch (err) {
        console.error('Error fetching scan data:', err);
        // Network / server failure: surface a friendly error and release the
        // lock so the user can retry. Do NOT navigate — we have not verified
        // the item, so sending the user into ItemDetails would be misleading.
        setError('Không thể kiểm tra mã lúc này.');
        setStatus('error');
        setScannedData(null);
        processingRef.current = false;
        lastProcessedValue.current = null;
        lastProcessedAt.current = 0;
      }
    },
    [onScanSuccess, toScanResult]
  );

  const processRawValue = useCallback(
    (raw: string, _source: ScanSource): boolean => {
      // ── 1. Already processing? Skip. ──────────────────────────
      if (processingRef.current) return false;

      // ── 2. Normalize + validate ───────────────────────────────
      const result = normalizeScanPayload(raw);
      if (!result.success) {
        setError(result.error);
        setStatus('error');
        return false;
      }

      const { itemId } = result;

      // ── 3. Dedupe: same value within window? Skip. ────────────
      const now = Date.now();
      if (
        lastProcessedValue.current === itemId &&
        now - lastProcessedAt.current < DEDUPE_WINDOW_MS
      ) {
        return false;
      }

      // ── 4. Acquire processing lock ────────────────────────────
      processingRef.current = true;
      lastProcessedValue.current = itemId;
      lastProcessedAt.current = now;

      setStatus('processing');
      setScannedData(itemId);
      setError(null);

      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      console.log('Processing scan:', itemId);

      // ── 5. Backend lookup ─────────────────────────────────────
      // On success the lock stays held until reset() (prevents re-navigation);
      // on failure fetchScanData releases it so the user can retry.
      fetchScanData(itemId);

      return true;
    },
    [fetchScanData]
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
