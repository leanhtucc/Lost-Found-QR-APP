import React from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, ShieldCheck } from 'lucide-react';
import { StatusFilterType } from '../hooks/useItemsFilter';

interface SummaryCardsProps {
  totalItems: number;
  safeCount: number;
  lostCount: number;
  statusFilter: StatusFilterType;
  onStatusFilterChange: (status: StatusFilterType) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalItems,
  safeCount,
  lostCount,
  statusFilter,
  onStatusFilterChange,
}) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onClick={() => onStatusFilterChange('all')}
        className={`card-elevated p-3 text-center transition-all ${
          statusFilter === 'all' ? 'ring-2 ring-primary border-primary/30' : ''
        }`}
      >
        <div className="w-10 h-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-2">
          <Package className="w-5 h-5 text-primary" />
        </div>
        <p className="text-lg font-display font-bold text-foreground">{totalItems}</p>
        <p className="text-xs text-muted-foreground">Tổng cộng</p>
      </motion.button>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => onStatusFilterChange('safe')}
        className={`card-elevated p-3 text-center transition-all ${
          statusFilter === 'safe' ? 'ring-2 ring-success border-success/30' : ''
        }`}
      >
        <div className="w-10 h-10 mx-auto rounded-xl bg-success/10 flex items-center justify-center mb-2">
          <ShieldCheck className="w-5 h-5 text-success" />
        </div>
        <p className="text-lg font-display font-bold text-foreground">{safeCount}</p>
        <p className="text-xs text-muted-foreground">An toàn</p>
      </motion.button>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onClick={() => onStatusFilterChange('lost')}
        className={`card-elevated p-3 text-center transition-all ${
          statusFilter === 'lost' ? 'ring-2 ring-destructive border-destructive/30' : ''
        }`}
      >
        <div className="w-10 h-10 mx-auto rounded-xl bg-destructive/10 flex items-center justify-center mb-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <p className="text-lg font-display font-bold text-foreground">{lostCount}</p>
        <p className="text-xs text-muted-foreground">Đang mất</p>
      </motion.button>
    </div>
  );
};
