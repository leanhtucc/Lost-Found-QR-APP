import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';
import { MY_ITEMS_COLORS, MY_ITEMS_RADIUS, MY_ITEMS_SHADOW } from '../constants/ui';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      <Search size={19} color={MY_ITEMS_COLORS.textMuted} />
      <TextInput
        style={styles.input}
        placeholder="Tìm theo tên hoặc mã..."
        value={value}
        onChangeText={onChange}
        placeholderTextColor={MY_ITEMS_COLORS.textMuted}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: MY_ITEMS_RADIUS.input,
    paddingHorizontal: 14,
    backgroundColor: MY_ITEMS_COLORS.surface,
    borderWidth: 1,
    borderColor: MY_ITEMS_COLORS.border,
    ...MY_ITEMS_SHADOW.card,
  },
  input: {
    flex: 1,
    height: 50,
    marginLeft: 10,
    fontSize: 15,
    color: MY_ITEMS_COLORS.textPrimary,
    fontWeight: '500',
  },
});
