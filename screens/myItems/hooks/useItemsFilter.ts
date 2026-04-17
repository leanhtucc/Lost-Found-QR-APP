import { useMemo } from 'react';
import { Item } from '@/types/item';

export type StatusFilterType = 'all' | 'safe' | 'lost';

const LOST_LIKE_STATUSES: Item['status'][] = ['LOST', 'PENDING_PAYMENT'];

const isLostLike = (status: Item['status']): boolean => LOST_LIKE_STATUSES.includes(status);

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
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'safe' && item.status === 'SAFE') ||
        (statusFilter === 'lost' && isLostLike(item.status));

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, searchQuery, categoryFilter, statusFilter]);

  const lostCount = useMemo(() => items.filter(i => isLostLike(i.status)).length, [items]);
  const safeCount = useMemo(() => items.filter(i => i.status === 'SAFE').length, [items]);

  return {
    filteredItems,
    lostCount,
    safeCount,
  };
};
