import React from 'react';
import { Plus } from 'lucide-react';

interface MyItemsHeaderProps {
  totalItems: number;
  onAddClick: () => void;
}

export const MyItemsHeader: React.FC<MyItemsHeaderProps> = ({ totalItems, onAddClick }) => {
  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">Đồ của tôi</h1>
            <p className="text-sm text-muted-foreground">{totalItems} món đồ đã đăng ký</p>
          </div>
          <button
            onClick={onAddClick}
            className="w-10 h-10 rounded-full btn-gradient flex items-center justify-center shadow-md hover:shadow-glow transition-all"
          >
            <Plus className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
};
