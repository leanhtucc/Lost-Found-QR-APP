import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Tìm theo tên hoặc mã..."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="pl-10 h-12 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-primary"
      />
    </div>
  );
};
