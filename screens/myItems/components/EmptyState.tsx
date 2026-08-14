import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Package, Filter, Plus } from 'lucide-react-native';
import {
  MY_ITEMS_COLORS,
  MY_ITEMS_PRIMARY_GRADIENT,
  MY_ITEMS_RADIUS,
  MY_ITEMS_SHADOW,
} from '../constants/ui';

interface EmptyStateProps {
  type: 'no-items' | 'no-results';
  onAddClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, onAddClick }) => {
  if (type === 'no-results') {
    return (
      <View style={styles.container}>
        <View style={[styles.iconCircle, styles.noResultCircle]}>
          <Filter size={34} color={MY_ITEMS_COLORS.textMuted} />
        </View>
        <Text style={styles.title}>Không tìm thấy kết quả</Text>
        <Text style={styles.subtitle}>Thử thay đổi bộ lọc hoặc từ khóa</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, styles.noItemCircle]}>
        <Package size={34} color={MY_ITEMS_COLORS.primaryStart} />
      </View>
      <Text style={styles.title}>Chưa có món đồ nào</Text>
      <Text style={styles.subtitle}>Hãy thêm món đồ đầu tiên để bảo vệ tài sản</Text>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onAddClick}
        accessibilityRole="button"
        accessibilityLabel="Thêm món đồ"
      >
        <LinearGradient
          colors={MY_ITEMS_PRIMARY_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.addButton}
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.addButtonText}>Thêm món đồ</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 52,
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 78,
    height: 78,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  noResultCircle: {
    backgroundColor: MY_ITEMS_COLORS.surfaceMuted,
  },
  noItemCircle: {
    backgroundColor: MY_ITEMS_COLORS.primarySoft,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: MY_ITEMS_COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: MY_ITEMS_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: MY_ITEMS_RADIUS.input,
    ...MY_ITEMS_SHADOW.elevated,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
