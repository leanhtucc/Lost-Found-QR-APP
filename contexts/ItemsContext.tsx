/**
 * ItemsContext
 * Context để quản lý danh sách items của người dùng
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Item, DashboardData } from '@/types/item';
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
  dashboardData: DashboardData | null;
  loading: boolean;
  refreshing: boolean;
  loadItems: () => Promise<void>;
  refresh: () => Promise<void>;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export const ItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = useCallback(async (showLoader = true, options?: { enableRetry?: boolean }) => {
    const enableRetry = options?.enableRetry ?? false;

    try {
      if (showLoader) setLoading(true);

      if (enableRetry) {
        try {
          const data = await itemsApi.getDashboardData();
          setDashboardData(data);
          return;
        } catch (firstError) {
          if (!shouldRetryPreloadError(firstError)) {
            throw firstError;
          }

          if (__DEV__) {
            console.log('[ItemsContext] Preload failed, retrying once...');
          }

          await wait(PRELOAD_RETRY_DELAY_MS);

          const retryData = await itemsApi.getDashboardData();
          setDashboardData(retryData);
          return;
        }
      }

      const data = await itemsApi.getDashboardData();
      setDashboardData(data);
    } catch (error: any) {
      const message = error?.message || '';

      if (message === 'No authentication token found') {
        return;
      }

      if (typeof message === 'string' && message.toLowerCase().includes('validation failed')) {
        setDashboardData({
          items: [],
          total: 0,
          safeCount: 0,
          lostCount: 0,
        });
        return;
      }

      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadItems(false);
  }, [loadItems]);

  useEffect(() => {
    void loadItems(true, { enableRetry: true });
  }, [loadItems]);

  const value: ItemsContextType = {
    items: dashboardData?.items || [],
    dashboardData,
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
