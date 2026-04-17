/**
 * ItemsContext
 * Context để quản lý danh sách items của người dùng
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Item, DashboardData, ItemsSummary, ItemStatus } from '@/types/item';
import { itemsApi } from '@/services/items';

const PRELOAD_RETRY_DELAY_MS = 900;

const wait = (milliseconds: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, milliseconds);
  });

const shouldRetryPreloadError = (error: unknown): boolean => {
  const message =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message?: unknown }).message || '').toLowerCase()
      : '';

  if (!message) {
    return true;
  }

  if (message.includes('no authentication token found')) {
    return false;
  }

  if (message.includes('validation failed')) {
    return false;
  }

  return true;
};

interface ItemsContextType {
  items: Item[];
  summary: ItemsSummary | null;
  loading: boolean;
  refreshing: boolean;
  loadItems: (
    statusFilter?: ItemStatus | 'all',
    showLoader?: boolean,
    options?: { enableRetry?: boolean }
  ) => Promise<void>;
  refresh: (statusFilter?: ItemStatus | 'all') => Promise<void>;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export const ItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [summary, setSummary] = useState<ItemsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummaryAndItems = async (statusFilter?: ItemStatus | 'all') => {
    // Gọi song song 2 API độc lập để tối ưu thời gian
    const [summaryData, itemsRes] = await Promise.all([
      itemsApi.getSummary(),
      itemsApi.getItems({
        limit: 50,
        status: statusFilter === 'all' ? undefined : (statusFilter as ItemStatus),
      }),
    ]);
    return { summaryData, itemsData: itemsRes.items };
  };

  const loadItems = useCallback(
    async (
      statusFilter: ItemStatus | 'all' = 'all',
      showLoader = true,
      options?: { enableRetry?: boolean }
    ) => {
      const enableRetry = options?.enableRetry ?? false;

      try {
        if (showLoader) setLoading(true);

        if (enableRetry) {
          try {
            const { summaryData, itemsData } = await fetchSummaryAndItems(statusFilter);
            setSummary(summaryData);
            setItems(itemsData);
            return;
          } catch (firstError) {
            if (!shouldRetryPreloadError(firstError)) {
              throw firstError;
            }

            if (__DEV__) {
              console.log('[ItemsContext] Preload failed, retrying once...');
            }

            await wait(PRELOAD_RETRY_DELAY_MS);

            const { summaryData, itemsData } = await fetchSummaryAndItems(statusFilter);
            setSummary(summaryData);
            setItems(itemsData);
            return;
          }
        }

        const { summaryData, itemsData } = await fetchSummaryAndItems(statusFilter);
        setSummary(summaryData);
        setItems(itemsData);
      } catch (error: any) {
        const message = error?.message || '';

        if (message === 'No authentication token found') {
          return;
        }

        if (typeof message === 'string' && message.toLowerCase().includes('validation failed')) {
          setItems([]);
          setSummary({
            totalItems: 0,
            safeItems: 0,
            lostItems: 0,
            foundItems: 0,
          });
          return;
        }

        console.error('Failed to load items:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  const refresh = useCallback(
    async (statusFilter: ItemStatus | 'all' = 'all') => {
      setRefreshing(true);
      await loadItems(statusFilter, false);
    },
    [loadItems]
  );

  const value: ItemsContextType = {
    items,
    summary,
    loading,
    refreshing,
    loadItems,
    refresh,
  };

  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>;
};

export const useItems = () => {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error('useItems must be used within ItemsProvider');
  }
  return context;
};
