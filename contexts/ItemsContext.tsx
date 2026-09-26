/**
 * ItemsContext
 * Context để quản lý danh sách items của người dùng
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Item, ItemsSummary, ItemStatus, CreateItemParams } from '@/types/item';
import { itemsApi } from '@/services/items';
import { sessionEvents } from '@/lib/sessionEvents';

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

  if (
    message.includes('token expired') ||
    message.includes('session expired') ||
    message.includes('unauthorized') ||
    message.includes('jwt expired')
  ) {
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
  error: string | null;
  loadItems: (
    statusFilter?: ItemStatus | 'all',
    showLoader?: boolean,
    options?: { enableRetry?: boolean }
  ) => Promise<void>;
  refresh: (statusFilter?: ItemStatus | 'all') => Promise<void>;
  addItem: (params: CreateItemParams) => Promise<Item>;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export const ItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [summary, setSummary] = useState<ItemsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummaryAndItems = async (statusFilter?: ItemStatus | 'all') => {
    // We only call getItems to avoid /summary endpoint which is throwing Validation failed!
    const itemsRes = await itemsApi.getItems({
      limit: 50,
      status: statusFilter === 'all' ? undefined : (statusFilter as ItemStatus),
    });

    // We compute local summary manually to avoid backend crash
    const safeItems = itemsRes.items.filter(item => item.status === 'SAFE').length;
    const lostItems = itemsRes.items.filter(item => item.status === 'LOST').length;
    const foundItems = itemsRes.items.filter(item => item.status === 'FOUND').length;

    const summaryData: ItemsSummary = {
      totalItems: itemsRes.items.length,
      safeItems,
      lostItems,
      foundItems,
    };

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
        setError(null);

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
          setError('Bạn cần đăng nhập để xem danh sách đồ dùng.');
          return;
        }

        if (
          typeof message === 'string' &&
          (message.toLowerCase().includes('token expired') ||
            message.toLowerCase().includes('session expired') ||
            message.toLowerCase().includes('unauthorized') ||
            message.toLowerCase().includes('jwt expired'))
        ) {
          sessionEvents.emitSessionExpired();
          return;
        }

        console.error('Failed to load items:', error);
        setError(message || 'Không thể tải danh sách đồ dùng. Vui lòng thử lại.');
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

  const addItem = useCallback(async (params: CreateItemParams): Promise<Item> => {
    const newItem = await itemsApi.createItem(params);
    setItems(prev => [newItem, ...prev]);
    setSummary(prev =>
      prev
        ? {
            ...prev,
            totalItems: prev.totalItems + 1,
            safeItems: prev.safeItems + 1,
          }
        : null
    );
    return newItem;
  }, []);

  const value: ItemsContextType = {
    items,
    summary,
    loading,
    refreshing,
    error,
    loadItems,
    refresh,
    addItem,
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
