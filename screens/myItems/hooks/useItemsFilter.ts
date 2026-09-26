import { useMemo } from 'react';
import { Item } from '@/types/item';

export type StatusFilterType = 'all' | 'safe' | 'lost';

interface UseItemsFilterProps {
  items: Item[];
  searchQuery: string;
  categoryFilter: Item['category'] | 'all';
  statusFilter: StatusFilterType;
}

export const filterItems = ({
  items,
  searchQuery,
  categoryFilter,
  statusFilter,
}: UseItemsFilterProps): Item[] =>
  items.filter(item => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch =
      normalizedQuery === '' || item.name.toLowerCase().includes(normalizedQuery);
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'safe' && item.status === 'SAFE') ||
      (statusFilter === 'lost' && item.status === 'LOST');

    return matchesSearch && matchesCategory && matchesStatus;
  });

export const getItemStatusCounts = (items: Item[]) => ({
  safeCount: items.filter(item => item.status === 'SAFE').length,
  lostCount: items.filter(item => item.status === 'LOST').length,
});

export const useItemsFilter = ({
  items,
  searchQuery,
  categoryFilter,
  statusFilter,
}: UseItemsFilterProps) => {
  const filteredItems = useMemo(() => {
    return filterItems({ items, searchQuery, categoryFilter, statusFilter });
  }, [items, searchQuery, categoryFilter, statusFilter]);

  const { lostCount, safeCount } = useMemo(() => getItemStatusCounts(items), [items]);

  return { filteredItems, lostCount, safeCount };
};
