/**
 * ItemCard Component - Web Version
 * Component hiển thị card cho từng item
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Package, Smartphone, Laptop, Wallet, Key, Briefcase } from 'lucide-react';
import { Item } from '@/types/item';

interface ItemCardProps {
  item: Item;
  index: number;
  onClick: () => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'phone':
      return Smartphone;
    case 'laptop':
    case 'electronics':
      return Laptop;
    case 'wallet':
      return Wallet;
    case 'keys':
      return Key;
    case 'bag':
      return Briefcase;
    default:
      return Package;
  }
};

export const ItemCard: React.FC<ItemCardProps> = ({ item, index, onClick }) => {
  const Icon = getCategoryIcon(item.category);
  const isLost = item.status === 'lost';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="card-elevated p-4 cursor-pointer hover:shadow-lg transition-all"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isLost ? 'bg-destructive/10' : 'bg-primary/10'
          }`}
        >
          <Icon className={`w-6 h-6 ${isLost ? 'text-destructive' : 'text-primary'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
          <p className="text-sm text-muted-foreground">
            {item.category} • {item.itemId}
          </p>
        </div>

        {isLost && (
          <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
            Đang mất
          </span>
        )}
      </div>
    </motion.div>
  );
};
