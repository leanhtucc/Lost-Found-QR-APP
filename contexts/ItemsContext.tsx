/**
 * ItemsContext
 * Context để quản lý danh sách items của người dùng
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Item, DashboardData } from '@/types/item';
import { itemsApi } from '@/services/items';

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

  const loadItems = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const data = await itemsApi.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load items:', error);
      throw error;
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
    loadItems();
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
