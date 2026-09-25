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
  Image,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  Camera,
  ImagePlus,
  RotateCcw,
  CheckCircle2,
  FileText,
  Gem,
  Sparkles,
  Map,
  Trash2,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ItemCategory } from '@/types/item';
import { itemsApi } from '@/services/items/api';
import { LocationPickerModal } from '@/components/molecules/LocationPickerModal';
import { MY_ITEMS_COLORS, MY_ITEMS_RADIUS, MY_ITEMS_PRIMARY_GRADIENT } from '../constants/ui';

export interface AddItemSubmitData {
  name: string;
  category: ItemCategory;
  description?: string;
  imageUri: string;
  imagePublicUrl?: string;
  uploadedFilename?: string;
  captureLocation: {
    latitude: number;
    longitude: number;
    address?: string;
    accuracyMeters?: number;
    capturedAt: string;
  };
}

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: AddItemSubmitData) => Promise<void>;
}

const CATEGORY_ITEMS: { value: ItemCategory; label: string; icon: React.ElementType }[] = [
  { value: 'electronics', label: 'Điện tử', icon: Laptop },
  { value: 'phone', label: 'Điện thoại', icon: Smartphone },
  { value: 'wallet', label: 'Ví tiền', icon: Wallet },
  { value: 'keys', label: 'Chìa khóa', icon: Key },
  { value: 'bag', label: 'Túi xách', icon: Briefcase },
  { value: 'documents', label: 'Giấy tờ', icon: FileText },
  { value: 'jewelry', label: 'Trang sức', icon: Gem },
  { value: 'other', label: 'Khác', icon: Package },
];

const mapAiCategory = (rawCategory?: string): ItemCategory => {
  if (!rawCategory) return 'other';
  const clean = rawCategory.toLowerCase().trim();
  if (clean === 'laptop') return 'electronics';
  const validCategories: ItemCategory[] = [
    'electronics',
    'phone',
    'wallet',
    'keys',
    'bag',
    'documents',
    'jewelry',
    'other',
  ];
  if (validCategories.includes(clean as ItemCategory)) {
    return clean as ItemCategory;
  }
  return 'other';
};

export const AddItemModal: React.FC<AddItemModalProps> = ({ visible, onClose, onSubmit }) => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 36 : 16);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('wallet');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imagePublicUrl, setImagePublicUrl] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);

  const [locationCoords, setLocationCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number | null;
  } | null>(null);
  const [locationAddress, setLocationAddress] = useState('');
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  const [isLocating, setIsLocating] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiDetected, setAiDetected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setCategory('wallet');
    setDescription('');
    setImageUri(null);
    setImagePublicUrl(null);
    setUploadedFilename(null);
    setLocationCoords(null);
    setLocationAddress('');
    setCapturedAt(null);
    setIsMapPickerOpen(false);
    setIsAnalyzing(false);
    setAiDetected(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const acquireLocation = async () => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền vị trí',
          'Vui lòng cấp quyền vị trí để tự động ghi nhận nơi cất giữ an toàn khi chụp ảnh.'
        );
        return null;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
      };

      setLocationCoords(coords);
      const now = new Date().toISOString();
      setCapturedAt(now);

      try {
        const [geo] = await Location.reverseGeocodeAsync({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });

        if (geo) {
          const parts = [
            geo.streetNumber,
            geo.street,
            geo.district || geo.subregion,
            geo.city || geo.region,
          ].filter(Boolean);
          if (parts.length > 0) {
            setLocationAddress(parts.join(', '));
          }
        }
      } catch {
        // Geocode error ignored
      }

      return coords;
    } catch (err: any) {
      Alert.alert('Lỗi định vị', err?.message || 'Không thể lấy vị trí hiện tại.');
      return null;
    } finally {
      setIsLocating(false);
    }
  };

  const handlePickImage = async (useCamera = true) => {
    try {
      setIsCapturing(true);
      let result: ImagePicker.ImagePickerResult;

      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Quyền Camera', 'Vui lòng cấp quyền Camera để chụp ảnh món đồ cần bảo vệ.');
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Thư viện ảnh', 'Vui lòng cấp quyền thư viện để chọn ảnh món đồ cần bảo vệ.');
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedUri = result.assets[0].uri;
        setImageUri(pickedUri);
        setImagePublicUrl(null);
        setUploadedFilename(null);
        setAiDetected(false);

        // 1. Tự động ghi nhận GPS song song
        const locationPromise = acquireLocation();

        // 2. Tự động phân tích ảnh bằng Gemini AI
        setIsAnalyzing(true);
        try {
          const aiResult = await itemsApi.analyzeItemImage(pickedUri);
          if (aiResult.name && aiResult.name !== 'Vật phẩm mới') {
            setName(aiResult.name);
            setAiDetected(true);
          }
          if (aiResult.category) {
            setCategory(mapAiCategory(aiResult.category));
          }
          if (aiResult.details?.ai_description) {
            setDescription(aiResult.details.ai_description);
          }
          if (aiResult.imagePublicUrl) {
            setImagePublicUrl(aiResult.imagePublicUrl);
          }
          if (aiResult.filename) {
            setUploadedFilename(aiResult.filename);
          }
        } catch (aiErr: any) {
          console.warn('[AddItemModal] AI analyze error:', aiErr?.message);
        } finally {
          setIsAnalyzing(false);
        }

        await locationPromise;
      }
    } catch (err: any) {
      Alert.alert('Lỗi xử lý ảnh', err?.message || 'Không thể chụp hoặc chọn ảnh.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên món đồ cần bảo vệ.');
      return;
    }

    if (!imageUri) {
      Alert.alert('Thiếu ảnh', 'Vui lòng chụp hoặc chọn ảnh món đồ trước khi đăng ký.');
      return;
    }

    if (!locationCoords) {
      Alert.alert(
        'Thiếu vị trí GPS',
        'Vui lòng bấm "Lấy lại vị trí" để ghi nhận tọa độ bảo vệ an toàn.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: trimmedName,
        category,
        description: description.trim() || undefined,
        imageUri,
        imagePublicUrl: imagePublicUrl || undefined,
        uploadedFilename: uploadedFilename || undefined,
        captureLocation: {
          latitude: locationCoords.latitude,
          longitude: locationCoords.longitude,
          address: locationAddress.trim() || undefined,
          accuracyMeters: locationCoords.accuracy ? Math.round(locationCoords.accuracy) : undefined,
          capturedAt: capturedAt || new Date().toISOString(),
        },
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
        <View style={[styles.container, { paddingBottom: bottomInset + 16 }]}>
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
              <Text style={styles.statusBadgeText}>Mặc định: AN TOÀN (SAFE) & Vị trí riêng tư</Text>
            </View>
            <Text style={styles.hintText}>
              Chụp ảnh và ghi nhận vị trí lúc đăng ký. Tọa độ này được bảo mật tuyệt đối, chỉ chủ sở
              hữu được xem.
            </Text>

            {/* Photo Capture Section */}
            <Text style={styles.label}>
              Ảnh món đồ <Text style={styles.required}>*</Text>
            </Text>

            {imageUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                <View style={styles.previewBadge}>
                  <CheckCircle2 size={14} color="#FFFFFF" />
                  <Text style={styles.previewBadgeText}>Ảnh đã chụp</Text>
                </View>
                <View style={styles.previewActions}>
                  <TouchableOpacity
                    style={styles.retakeBtn}
                    onPress={() => handlePickImage(true)}
                    disabled={isCapturing}
                  >
                    <RotateCcw size={14} color="#FFFFFF" />
                    <Text style={styles.retakeBtnText}>Chụp lại</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.retakeBtn}
                    onPress={() => handlePickImage(false)}
                    disabled={isCapturing}
                  >
                    <ImagePlus size={14} color="#FFFFFF" />
                    <Text style={styles.retakeBtnText}>Chọn ảnh khác</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.photoPickerBox}>
                <TouchableOpacity
                  style={styles.cameraActionBtn}
                  onPress={() => handlePickImage(true)}
                  disabled={isCapturing}
                  activeOpacity={0.8}
                >
                  <Camera size={26} color="#FFFFFF" />
                  <Text style={styles.cameraActionText}>Chụp ảnh ngay (Khuyến nghị)</Text>
                  <Text style={styles.cameraActionSub}>Tự động ghi nhận GPS chính xác</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.galleryActionBtn}
                  onPress={() => handlePickImage(false)}
                  disabled={isCapturing}
                  activeOpacity={0.7}
                >
                  <ImagePlus size={18} color={MY_ITEMS_COLORS.textSecondary} />
                  <Text style={styles.galleryActionText}>Hoặc chọn từ thư viện</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* AI Analysis Status Banner */}
            {isAnalyzing && (
              <View style={styles.aiBanner}>
                <ActivityIndicator size="small" color={MY_ITEMS_COLORS.primaryStart} />
                <Text style={styles.aiBannerText}>
                  Gemini AI đang phân tích ảnh, nhận diện tên & danh mục...
                </Text>
              </View>
            )}

            {!isAnalyzing && aiDetected && (
              <View style={styles.aiSuccessBanner}>
                <Sparkles size={16} color={MY_ITEMS_COLORS.safeText} />
                <Text style={styles.aiSuccessText}>
                  AI đã tự động gợi ý tên & danh mục từ ảnh chụp!
                </Text>
              </View>
            )}

            {/* Location Section */}
            <View style={styles.sectionDivider} />
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWrap}>
                <MapPin size={18} color={MY_ITEMS_COLORS.primaryStart} />
                <Text style={styles.sectionTitle}>
                  Vị trí đăng ký bảo vệ <Text style={styles.required}>*</Text>
                </Text>
              </View>
              <TouchableOpacity
                style={styles.locationBtn}
                onPress={() => setIsMapPickerOpen(true)}
                activeOpacity={0.8}
              >
                <Map size={14} color={MY_ITEMS_COLORS.primaryStart} />
                <Text style={styles.locationBtnText}>
                  {locationCoords ? 'Đổi vị trí' : 'Chọn trên bản đồ'}
                </Text>
              </TouchableOpacity>
            </View>

            {locationCoords ? (
              <View style={styles.locationCard}>
                <View style={styles.locationCardHeader}>
                  <CheckCircle2 size={16} color={MY_ITEMS_COLORS.safeText} />
                  <Text style={styles.locationCardTitle}>Vị trí đã xác thực</Text>
                </View>

                <Text style={styles.locationCoordText}>
                  Tọa độ: {locationCoords.latitude.toFixed(5)},{' '}
                  {locationCoords.longitude.toFixed(5)}
                  {locationCoords.accuracy !== undefined && locationCoords.accuracy !== null
                    ? ` (±${Math.round(locationCoords.accuracy)}m)`
                    : ''}
                </Text>

                {capturedAt ? (
                  <Text style={styles.locationTimeText}>
                    Thời điểm: {new Date(capturedAt).toLocaleTimeString('vi-VN')} ngày{' '}
                    {new Date(capturedAt).toLocaleDateString('vi-VN')}
                  </Text>
                ) : null}

                <Text style={styles.labelSmall}>Địa chỉ ghi nhận (có thể chỉnh sửa nếu cần):</Text>
                <TextInput
                  style={styles.locationInput}
                  placeholder="Nhập địa chỉ cất giữ đồ..."
                  placeholderTextColor={MY_ITEMS_COLORS.textMuted}
                  value={locationAddress}
                  onChangeText={setLocationAddress}
                />

                <View style={styles.locationActionsRow}>
                  <TouchableOpacity
                    style={styles.locationActionEditBtn}
                    onPress={() => setIsMapPickerOpen(true)}
                    activeOpacity={0.8}
                  >
                    <Map size={14} color={MY_ITEMS_COLORS.primaryStart} />
                    <Text style={styles.locationActionEditText}>Mở bản đồ tinh chỉnh</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.locationActionDeleteBtn}
                    onPress={() => {
                      setLocationCoords(null);
                      setLocationAddress('');
                      setCapturedAt(null);
                    }}
                    activeOpacity={0.8}
                  >
                    <Trash2 size={14} color="#FF6B6B" />
                    <Text style={styles.locationActionDeleteText}>Xóa vị trí</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.locationPromptGrid}>
                <TouchableOpacity
                  style={styles.locationMapPromptBtn}
                  onPress={() => setIsMapPickerOpen(true)}
                  activeOpacity={0.85}
                >
                  <Map size={20} color="#FFFFFF" />
                  <Text style={styles.locationMapPromptText}>Chọn trên bản đồ</Text>
                  <Text style={styles.locationMapPromptSub}>Chạm hoặc kéo ghim chính xác</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.locationGpsPromptBtn}
                  onPress={acquireLocation}
                  disabled={isLocating}
                  activeOpacity={0.8}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color={MY_ITEMS_COLORS.primaryStart} />
                  ) : (
                    <>
                      <Crosshair size={18} color={MY_ITEMS_COLORS.primaryStart} />
                      <Text style={styles.locationGpsPromptText}>Lấy nhanh GPS</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Field: Item Name */}
            <View style={styles.sectionDivider} />
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
              placeholder="VD: Màu đen, có logo màu bạc, tem số seri..."
              placeholderTextColor={MY_ITEMS_COLORS.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
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
              style={[
                styles.submitBtnWrap,
                (!imageUri || !locationCoords || !name.trim() || isSubmitting) &&
                  styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!imageUri || !locationCoords || !name.trim() || isSubmitting}
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
                  <Text style={styles.submitBtnText}>Đăng ký bảo vệ món đồ</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <LocationPickerModal
        visible={isMapPickerOpen}
        title="Vị trí đăng ký bảo vệ"
        subtitle="Chạm vào bản đồ hoặc kéo ghim để chọn vị trí cất giữ an toàn"
        initialCoordinate={locationCoords}
        initialAddress={locationAddress}
        onClose={() => setIsMapPickerOpen(false)}
        onConfirm={loc => {
          setLocationCoords({
            latitude: loc.latitude,
            longitude: loc.longitude,
            accuracy: loc.accuracyMeters,
          });
          if (loc.address) {
            setLocationAddress(loc.address);
          }
          setCapturedAt(loc.capturedAt || new Date().toISOString());
          setIsMapPickerOpen(false);
        }}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: MY_ITEMS_COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
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
  labelSmall: {
    color: MY_ITEMS_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 4,
  },
  required: {
    color: '#FF6B6B',
  },
  photoPickerBox: {
    gap: 8,
    marginBottom: 14,
  },
  cameraActionBtn: {
    backgroundColor: MY_ITEMS_COLORS.primaryStart,
    borderRadius: MY_ITEMS_RADIUS.card,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  cameraActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cameraActionSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  galleryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: MY_ITEMS_COLORS.surfaceMuted,
    borderRadius: MY_ITEMS_RADIUS.card,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: MY_ITEMS_COLORS.border,
  },
  galleryActionText: {
    color: MY_ITEMS_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  previewContainer: {
    borderRadius: MY_ITEMS_RADIUS.card,
    overflow: 'hidden',
    backgroundColor: MY_ITEMS_COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: MY_ITEMS_COLORS.border,
    marginBottom: 14,
  },
  previewImage: {
    width: '100%',
    height: 180,
  },
  previewBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(46, 204, 139, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  previewBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  previewActions: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  retakeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  locationCard: {
    backgroundColor: MY_ITEMS_COLORS.surfaceMuted,
    borderRadius: MY_ITEMS_RADIUS.card,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 139, 0.3)',
    marginBottom: 14,
  },
  locationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  locationCardTitle: {
    color: MY_ITEMS_COLORS.safeText,
    fontSize: 13,
    fontWeight: '700',
  },
  locationCoordText: {
    color: MY_ITEMS_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  locationTimeText: {
    color: MY_ITEMS_COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  locationInput: {
    backgroundColor: MY_ITEMS_COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: MY_ITEMS_COLORS.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: MY_ITEMS_COLORS.border,
  },
  locationPromptBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: MY_ITEMS_COLORS.surfaceMuted,
    borderRadius: MY_ITEMS_RADIUS.card,
    padding: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: MY_ITEMS_COLORS.primaryStart,
    marginBottom: 14,
  },
  locationPromptText: {
    flex: 1,
    color: MY_ITEMS_COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  locationActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: MY_ITEMS_COLORS.border,
  },
  locationActionEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: MY_ITEMS_COLORS.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  locationActionEditText: {
    color: MY_ITEMS_COLORS.primaryStart,
    fontSize: 12,
    fontWeight: '600',
  },
  locationActionDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  locationActionDeleteText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
  },
  locationPromptGrid: {
    gap: 8,
    marginBottom: 14,
  },
  locationMapPromptBtn: {
    backgroundColor: MY_ITEMS_COLORS.primaryStart,
    borderRadius: MY_ITEMS_RADIUS.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  locationMapPromptText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  locationMapPromptSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  locationGpsPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: MY_ITEMS_COLORS.surfaceMuted,
    borderRadius: MY_ITEMS_RADIUS.card,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: MY_ITEMS_COLORS.border,
  },
  locationGpsPromptText: {
    color: MY_ITEMS_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
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
    marginBottom: 10,
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
  submitBtnDisabled: {
    opacity: 0.5,
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
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(108, 76, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(108, 76, 241, 0.35)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  aiBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#A78BFA',
  },
  aiSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: MY_ITEMS_COLORS.safeSoft,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 139, 0.35)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  aiSuccessText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: MY_ITEMS_COLORS.safeText,
  },
});
