import React from 'react';
import { Item } from '@/types/item';
import { ItemCard } from '@/components/ItemCard';
import { StatusFilterType } from '../hooks/useItemsFilter';
import { EmptyState } from './EmptyState';

interface ItemsListProps {
  items: Item[];
  filteredItems: Item[];
  statusFilter: StatusFilterType;
  onSelectItem: (id: string) => void;
  onAddClick: () => void;
}

export const ItemsList: React.FC<ItemsListProps> = ({
  items,
  filteredItems,
  statusFilter,
  onSelectItem,
  onAddClick,
}) => {
  const getStatusLabel = () => {
    switch (statusFilter) {
      case 'safe':
        return 'An toàn';
      case 'lost':
        return 'Đang mất';
      default:
        return 'Tất cả';
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-foreground">{getStatusLabel()}</h2>
        <span className="text-sm text-muted-foreground">{filteredItems.length} kết quả</span>
      </div>

      <div className="space-y-3 pb-24">
        {filteredItems.map((item, index) => (
          <ItemCard key={item.id} item={item} index={index} onClick={() => onSelectItem(item.id)} />
        ))}

        {filteredItems.length === 0 && items.length > 0 && <EmptyState type="no-results" />}

        {items.length === 0 && <EmptyState type="no-items" onAddClick={onAddClick} />}
      </div>
    </>
  );
};
