import React from 'react';
import { motion } from 'framer-motion';
import { Package, Filter, Plus } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-items' | 'no-results';
  onAddClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, onAddClick }) => {
  if (type === 'no-results') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
          <Filter className="w-10 h-10 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">Không tìm thấy kết quả</p>
        <p className="text-sm text-muted-foreground mt-1">Thử thay đổi bộ lọc hoặc từ khóa</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
        <Package className="w-10 h-10 text-primary" />
      </div>
      <p className="font-medium text-foreground">Chưa có món đồ nào</p>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        Hãy thêm món đồ đầu tiên để bắt đầu bảo vệ tài sản
      </p>
      <button
        onClick={onAddClick}
        className="px-6 py-3 btn-gradient rounded-xl text-sm font-semibold"
      >
        <Plus className="w-4 h-4 inline mr-2" />
        Thêm món đồ
      </button>
    </motion.div>
  );
};
