import React from 'react';
import { Item } from '@/types/item';
import { categoryOptions } from '../constants/categories';

interface CategoryFilterProps {
  selectedCategory: Item['category'] | 'all';
  onCategoryChange: (category: Item['category'] | 'all') => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categoryOptions.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => onCategoryChange(value)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            selectedCategory === value
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
          }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
};
