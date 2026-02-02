/**
 * SearchBar Component
 * Thanh tìm kiếm và filter tài sản
 */

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { Search, X, SlidersHorizontal } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

export type FilterType = 'all' | 'safe' | 'lost';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange?: (filter: FilterType) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onFilterChange,
  placeholder = 'Tìm kiếm tài sản...',
}) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
    setShowFilters(false);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <View className="mb-4">
      {/* Search Input */}
      <View className="relative">
        {/* Search Icon - Left */}
        <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
          <Search size={20} color="#9ca3af" />
        </View>

        <TextInput
          value={query}
          onChangeText={handleSearch}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          className="w-full h-12 pl-12 pr-24 rounded-2xl bg-gray-100 border border-gray-200 text-gray-900 text-base"
          style={{ lineHeight: 20 }}
        />

        {/* Right buttons */}
        <View className="absolute right-2 top-0 bottom-0 flex-row items-center gap-1">
          {query.length > 0 && (
            <TouchableOpacity
              onPress={clearSearch}
              className="w-8 h-8 items-center justify-center rounded-lg active:bg-gray-200"
            >
              <X size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className={`w-8 h-8 items-center justify-center rounded-lg ${
              showFilters || activeFilter !== 'all' ? 'bg-blue-100' : 'active:bg-gray-200'
            }`}
          >
            <SlidersHorizontal
              size={18}
              color={showFilters || activeFilter !== 'all' ? '#3b82f6' : '#9ca3af'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Chips */}
      {showFilters && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          layout={Layout.springify()}
          className="flex-row gap-2 mt-3"
        >
          <FilterChip
            label="Tất cả"
            active={activeFilter === 'all'}
            onPress={() => handleFilterChange('all')}
          />
          <FilterChip
            label="An toàn"
            active={activeFilter === 'safe'}
            onPress={() => handleFilterChange('safe')}
            color="success"
          />
          <FilterChip
            label="Đang mất"
            active={activeFilter === 'lost'}
            onPress={() => handleFilterChange('lost')}
            color="destructive"
          />
        </Animated.View>
      )}
    </View>
  );
};

// FilterChip sub-component
interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  color?: 'default' | 'success' | 'destructive';
}

const FilterChip: React.FC<FilterChipProps> = ({ label, active, onPress, color = 'default' }) => {
  const getChipStyle = () => {
    if (active) {
      switch (color) {
        case 'success':
          return 'bg-green-500';
        case 'destructive':
          return 'bg-red-500';
        default:
          return 'bg-blue-500';
      }
    }
    return 'bg-gray-200';
  };

  const getTextStyle = () => {
    return active ? 'text-white' : 'text-gray-600';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`px-4 py-2 rounded-full ${getChipStyle()}`}
    >
      <Text className={`text-sm font-medium ${getTextStyle()}`}>{label}</Text>
    </TouchableOpacity>
  );
};

export default SearchBar;
