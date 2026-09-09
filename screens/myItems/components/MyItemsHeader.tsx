import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'lucide-react-native';
import { MY_ITEMS_COLORS, MY_ITEMS_RADIUS, MY_ITEMS_SHADOW } from '../constants/ui';

interface MyItemsHeaderProps {
  totalItems: number;
  onAddClick: () => void;
}

export const MyItemsHeader: React.FC<MyItemsHeaderProps> = ({ totalItems, onAddClick }) => {
  return (
    <LinearGradient
      colors={['rgba(26, 21, 48, 0.96)', 'rgba(20, 18, 34, 0.96)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.wrapper}
    >
      <View>
        <Text style={styles.title}>Đồ của tôi</Text>
        <Text style={styles.subtitle}>{totalItems} món đồ đã đăng ký</Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onAddClick}
        accessibilityRole="button"
        accessibilityLabel="Thêm món đồ"
        style={styles.addButtonTouchArea}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <LinearGradient
          colors={['#7C6AF6', '#6B5AE8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.addButtonGradient}
          pointerEvents="none"
        >
          <Plus size={20} color="#F9F5FD" strokeWidth={2.5} />
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: MY_ITEMS_COLORS.border,
    zIndex: 10,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: MY_ITEMS_COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: MY_ITEMS_COLORS.textSecondary,
    fontWeight: '500',
  },
  addButtonTouchArea: {
    borderRadius: MY_ITEMS_RADIUS.chip,
  },
  addButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: MY_ITEMS_RADIUS.chip,
    alignItems: 'center',
    justifyContent: 'center',
    ...MY_ITEMS_SHADOW.elevated,
  },
});
