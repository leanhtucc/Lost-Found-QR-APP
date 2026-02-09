import { Package, Laptop, Wallet, Key, Smartphone, Briefcase } from 'lucide-react';
import { Item } from '@/types/item';

export const categoryOptions: {
  value: Item['category'] | 'all';
  label: string;
  icon: React.ElementType;
}[] = [
  { value: 'all', label: 'Tất cả', icon: Package },
  { value: 'laptop', label: 'Laptop', icon: Laptop },
  { value: 'phone', label: 'Điện thoại', icon: Smartphone },
  { value: 'wallet', label: 'Ví', icon: Wallet },
  { value: 'keys', label: 'Chìa khóa', icon: Key },
  { value: 'bag', label: 'Túi xách', icon: Briefcase },
  { value: 'other', label: 'Khác', icon: Package },
];
