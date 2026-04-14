import React from 'react';
import { View, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <View className="flex-row items-center mx-4 mt-4 bg-gray-50 rounded-xl px-3">
      <Search size={20} color={FIND_BACK.labelText} className="mr-2" />
      <TextInput
        className="flex-1 h-12 text-base text-gray-900"
        placeholder="Tìm theo tên hoặc mã..."
        value={value}
        onChangeText={onChange}
        placeholderTextColor={FIND_BACK.labelText}
      />
    </View>
  );
};
