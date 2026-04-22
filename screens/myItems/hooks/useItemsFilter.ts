import { useMemo } from 'react';
import { Item } from '@/types/item';

export type StatusFilterType = 'all' | 'safe' | 'lost';

interface UseItemsFilterProps {
  items: Item[];
  searchQuery: string;
  categoryFilter: Item['category'] | 'all';
  statusFilter: StatusFilterType;
}

export const useItemsFilter = ({
  items,
  searchQuery,
  categoryFilter,
  statusFilter,
}: UseItemsFilterProps) => {
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'safe' && item.status === 'SAFE') ||
        (statusFilter === 'lost' && (item.status === 'LOST' || item.status === 'PENDING_PAYMENT'));

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, searchQuery, categoryFilter, statusFilter]);

  const lostCount = useMemo(
    () => items.filter(item => item.status === 'LOST' || item.status === 'PENDING_PAYMENT').length,
    [items]
  );

  const safeCount = useMemo(() => items.filter(item => item.status === 'SAFE').length, [items]);

  return { filteredItems, lostCount, safeCount };
};
