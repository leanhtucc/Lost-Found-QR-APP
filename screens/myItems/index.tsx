import React, { useState } from 'react';
import { useItems } from '@/contexts/ItemsContext';
import { Item } from '@/types/item';
import { AddItemModal } from '@/components/AddItemModal';
import { MyItemsHeader } from './components/MyItemsHeader';
import { SummaryCards } from './components/SummaryCards';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { ItemsList } from './components/ItemsList';
import { useItemsFilter, StatusFilterType } from './hooks/useItemsFilter';

interface MyItemsProps {
  onSelectItem: (id: string) => void;
}

export const MyItems: React.FC<MyItemsProps> = ({ onSelectItem }) => {
  const { items } = useItems();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Item['category'] | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');

  const { filteredItems, lostCount, safeCount } = useItemsFilter({
    items,
    searchQuery,
    categoryFilter,
    statusFilter,
  });

  const handleAddClick = () => setShowAddModal(true);
  const handleCloseModal = () => setShowAddModal(false);

  return (
    <div className="min-h-screen bg-background">
      <MyItemsHeader totalItems={items.length} onAddClick={handleAddClick} />

      <div className="container py-4 space-y-4">
        <SummaryCards
          totalItems={items.length}
          safeCount={safeCount}
          lostCount={lostCount}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <CategoryFilter selectedCategory={categoryFilter} onCategoryChange={setCategoryFilter} />

        <ItemsList
          items={items}
          filteredItems={filteredItems}
          statusFilter={statusFilter}
          onSelectItem={onSelectItem}
          onAddClick={handleAddClick}
        />
      </div>

      <AddItemModal isOpen={showAddModal} onClose={handleCloseModal} />
    </div>
  );
};
