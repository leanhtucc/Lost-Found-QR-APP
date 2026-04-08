/**
 * AddItemModal Component - Web Version
 * Modal để thêm item mới
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Smartphone, Laptop, Wallet, Key, Briefcase } from 'lucide-react';
import { ItemCategory } from '@/types/item';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories: { value: ItemCategory; label: string; icon: React.ElementType }[] = [
  { value: 'electronics', label: 'Điện tử', icon: Laptop },
  { value: 'phone', label: 'Điện thoại', icon: Smartphone },
  { value: 'wallet', label: 'Ví', icon: Wallet },
  { value: 'keys', label: 'Chìa khóa', icon: Key },
  { value: 'bag', label: 'Túi xách', icon: Briefcase },
  { value: 'other', label: 'Khác', icon: Package },
];

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('electronics');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement add item logic
    console.log({ name, category, description });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto z-50 bg-card rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold text-foreground">Thêm món đồ mới</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tên món đồ</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border-0 focus:ring-2 focus:ring-primary"
                  placeholder="VD: iPhone 13 Pro"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Danh mục</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setCategory(value)}
                      className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                        category === value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mô tả (tùy chọn)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border-0 focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Thêm mô tả cho món đồ..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl btn-gradient text-primary-foreground font-semibold hover:shadow-lg transition-all"
                >
                  Thêm món đồ
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
