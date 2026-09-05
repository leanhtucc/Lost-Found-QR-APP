import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import {
  X,
  ShieldCheck,
  MapPin,
  Crosshair,
  Package,
  Laptop,
  Smartphone,
  Wallet,
  Key,
  Briefcase,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ItemCategory } from '@/types/item';
import { MY_ITEMS_COLORS, MY_ITEMS_RADIUS, MY_ITEMS_PRIMARY_GRADIENT } from '../constants/ui';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    category: ItemCategory;
    description?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  }) => Promise<void>;
}

const CATEGORY_ITEMS: { value: ItemCategory; label: string; icon: React.ElementType }[] = [
  { value: 'electronics', label: 'Điện tử', icon: Laptop },
  { value: 'phone', label: 'Điện thoại', icon: Smartphone },
  { value: 'wallet', label: 'Ví tiền', icon: Wallet },
  { value: 'keys', label: 'Chìa khóa', icon: Key },
  { value: 'bag', label: 'Túi xách', icon: Briefcase },
  { value: 'other', label: 'Khác', icon: Package },
];

export const AddItemModal: React.FC<AddItemModalProps> = ({ visible, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('wallet');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setCategory('wallet');
    setDescription('');
    setAddress('');
    setLatitude('');
    setLongitude('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleGetCurrentLocation = async () => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền vị trí', 'Vui lòng cấp quyền truy cập vị trí để lấy tọa độ tự động.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLatitude(String(location.coords.latitude.toFixed(6)));
      setLongitude(String(location.coords.longitude.toFixed(6)));

      try {
        const [geo] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (geo) {
          const parts = [
            geo.streetNumber,
            geo.street,
            geo.district || geo.subregion,
            geo.city || geo.region,
          ].filter(Boolean);
          if (parts.length > 0 && !address) {
            setAddress(parts.join(', '));
          }
        }
      } catch {
        // Geocode error ignored
      }
    } catch (err: any) {
      Alert.alert('Lỗi lấy vị trí', err?.message || 'Không thể lấy vị trí hiện tại.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên món đồ cần bảo vệ.');
      return;
    }

    let parsedLat: number | undefined = undefined;
    let parsedLng: number | undefined = undefined;

    if (latitude.trim() || longitude.trim()) {
      parsedLat = Number(latitude.trim());
      parsedLng = Number(longitude.trim());

      if (!Number.isFinite(parsedLat) || parsedLat < -90 || parsedLat > 90) {
        Alert.alert('Tọa độ không hợp lệ', 'Vĩ độ (Latitude) phải nằm trong khoảng -90 đến 90.');
        return;
      }

      if (!Number.isFinite(parsedLng) || parsedLng < -180 || parsedLng > 180) {
        Alert.alert(
          'Tọa độ không hợp lệ',
          'Kinh độ (Longitude) phải nằm trong khoảng -180 đến 180.'
        );
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: trimmedName,
        category,
        description: description.trim() || undefined,
        address: address.trim() || undefined,
        latitude: parsedLat,
        longitude: parsedLng,
      });
      resetForm();
      onClose();
    } catch (err: any) {
      Alert.alert('Lỗi đăng ký', err?.message || 'Không thể tạo món đồ. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.shieldIconWrap}>
                <ShieldCheck size={20} color={MY_ITEMS_COLORS.safeText} />
              </View>
              <Text style={styles.title}>Bảo vệ món đồ mới</Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={MY_ITEMS_COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Status explanation badge */}
            <View style={styles.statusBadge}>
              <ShieldCheck size={16} color={MY_ITEMS_COLORS.safeText} />
              <Text style={styles.statusBadgeText}>Mặc định: AN TOÀN (SAFE)</Text>
            </View>
            <Text style={styles.hintText}>
              Món đồ sau khi đăng ký sẽ được giám sát an toàn. Khi thất lạc, bạn chỉ cần kích hoạt
              &quot;Báo mất&quot; để đẩy thông báo lên Radar công khai cho mọi người xung quanh.
            </Text>

            {/* Field: Item Name */}
            <Text style={styles.label}>
              Tên món đồ <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Ví da Montblanc, Laptop Dell XPS..."
              placeholderTextColor={MY_ITEMS_COLORS.textMuted}
              value={name}
              onChangeText={setName}
              maxLength={100}
            />

            {/* Field: Category */}
            <Text style={styles.label}>Danh mục</Text>
            <View style={styles.categoryGrid}>
              {CATEGORY_ITEMS.map(cat => {
                const isSelected = category === cat.value;
                const IconComponent = cat.icon;
                return (
                  <TouchableOpacity
                    key={cat.value}
                    style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                    onPress={() => setCategory(cat.value)}
                    activeOpacity={0.7}
                  >
                    <IconComponent
                      size={16}
                      color={isSelected ? '#FFFFFF' : MY_ITEMS_COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && styles.categoryChipTextSelected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Field: Description */}
            <Text style={styles.label}>Đặc điểm nhận dạng (tùy chọn)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="VD: Màu đen, có móc khóa gấu bông màu đỏ, tem số seri..."
              placeholderTextColor={MY_ITEMS_COLORS.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={500}
            />

            {/* Location Section */}
            <View style={styles.sectionDivider} />
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWrap}>
                <MapPin size={18} color={MY_ITEMS_COLORS.primaryStart} />
                <Text style={styles.sectionTitle}>Tọa độ & Địa chỉ cất giữ an toàn</Text>
              </View>
              <TouchableOpacity
                style={styles.locationBtn}
                onPress={handleGetCurrentLocation}
                disabled={isLocating}
                activeOpacity={0.8}
              >
                {isLocating ? (
                  <ActivityIndicator size="small" color={MY_ITEMS_COLORS.primaryStart} />
                ) : (
                  <>
                    <Crosshair size={14} color={MY_ITEMS_COLORS.primaryStart} />
                    <Text style={styles.locationBtnText}>Lấy vị trí</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Field: Address */}
            <Text style={styles.label}>Địa chỉ / Nơi để</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Nhà riêng - 123 Cầu Giấy, Hà Nội"
              placeholderTextColor={MY_ITEMS_COLORS.textMuted}
              value={address}
              onChangeText={setAddress}
            />

            {/* Field: Lat / Lng */}
            <View style={styles.coordsRow}>
              <View style={styles.coordField}>
                <Text style={styles.label}>Vĩ độ (Lat)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="21.028511"
                  placeholderTextColor={MY_ITEMS_COLORS.textMuted}
                  value={latitude}
                  onChangeText={setLatitude}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.coordField}>
                <Text style={styles.label}>Kinh độ (Lng)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="105.854444"
                  placeholderTextColor={MY_ITEMS_COLORS.textMuted}
                  value={longitude}
                  onChangeText={setLongitude}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitBtnWrap}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={MY_ITEMS_PRIMARY_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitBtn}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Đăng ký bảo vệ</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: MY_ITEMS_COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: MY_ITEMS_COLORS.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shieldIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MY_ITEMS_COLORS.safeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: MY_ITEMS_COLORS.textPrimary,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    paddingHorizontal: 20,
  },
  bodyContent: {
    paddingVertical: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MY_ITEMS_COLORS.safeSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 8,
  },
  statusBadgeText: {
    color: MY_ITEMS_COLORS.safeText,
    fontSize: 12,
    fontWeight: '700',
  },
  hintText: {
    color: MY_ITEMS_COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  label: {
    color: MY_ITEMS_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  required: {
    color: '#FF6B6B',
  },
  input: {
    backgroundColor: MY_ITEMS_COLORS.surfaceMuted,
    borderRadius: MY_ITEMS_RADIUS.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: MY_ITEMS_COLORS.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: MY_ITEMS_COLORS.border,
    marginBottom: 14,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: MY_ITEMS_COLORS.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: MY_ITEMS_RADIUS.chip,
    borderWidth: 1,
    borderColor: MY_ITEMS_COLORS.border,
  },
  categoryChipSelected: {
    backgroundColor: MY_ITEMS_COLORS.primaryStart,
    borderColor: MY_ITEMS_COLORS.primaryStart,
  },
  categoryChipText: {
    color: MY_ITEMS_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: MY_ITEMS_COLORS.border,
    marginVertical: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    color: MY_ITEMS_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: MY_ITEMS_COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  locationBtnText: {
    color: MY_ITEMS_COLORS.primaryStart,
    fontSize: 12,
    fontWeight: '600',
  },
  coordsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  coordField: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: MY_ITEMS_COLORS.border,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: MY_ITEMS_COLORS.surfaceMuted,
    paddingVertical: 14,
    borderRadius: MY_ITEMS_RADIUS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: MY_ITEMS_COLORS.border,
  },
  cancelBtnText: {
    color: MY_ITEMS_COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  submitBtnWrap: {
    flex: 2,
    borderRadius: MY_ITEMS_RADIUS.card,
    overflow: 'hidden',
  },
  submitBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
