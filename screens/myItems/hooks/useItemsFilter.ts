import { useMemo } from 'react';
import { Item } from '@/types/item';

export type StatusFilterType = 'all' | 'safe' | 'lost';

const LOST_LIKE_STATUSES: Item['status'][] = ['LOST', 'PENDING_PAYMENT'];

const isLostLike = (status: Item['status']): boolean => LOST_LIKE_STATUSES.includes(status);

interface UseItemsFilterProps {
  items: Item[];
  searchQuery: string;
  categoryFilter: Item['category'] | 'all';
}

export const useItemsFilter = ({ items, searchQuery, categoryFilter }: UseItemsFilterProps) => {
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, categoryFilter]);

  return {
    filteredItems,
  };
};
