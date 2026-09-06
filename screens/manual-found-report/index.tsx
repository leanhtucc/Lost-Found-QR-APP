import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewRef,
} from 'react-native-keyboard-controller';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import {
  ArrowLeft,
  Camera,
  Check,
  Crosshair,
  ImageIcon,
  MapPin,
  Search,
  Send,
  Sparkles,
  Tag,
  Type,
  X,
} from 'lucide-react-native';
import type { RootStackParamList } from '@navigation/index';
import { FIND_BACK } from '@constants/theme';
import { FONT_FAMILY } from '@constants/fonts';
import { mapApi, MapAutocompletePrediction } from '@/services/map';
import { itemsApi } from '@/services/items';
import { CATEGORY_CONFIG, ItemCategory } from '@/types/item';

type ManualFoundReportNav = StackNavigationProp<RootStackParamList, 'ManualFoundReport'>;

const CATEGORY_OPTIONS: { value: ItemCategory; label: string }[] = Object.entries(
  CATEGORY_CONFIG
).map(([key, config]) => ({
  value: key as ItemCategory,
  label: config.label,
}));

const DEFAULT_MAP_REGION: Region = {
  latitude: 21.027763,
  longitude: 105.83416,
  latitudeDelta: 0.018,
  longitudeDelta: 0.018,
};

const toAddressString = (location: Location.LocationGeocodedAddress): string => {
  if (location.formattedAddress?.trim()) return location.formattedAddress.trim();

  return [
    location.name,
    [location.streetNumber, location.street].filter(Boolean).join(' '),
    location.district,
    location.city,
    location.region,
  ]
    .map(value => value?.trim())
    .filter(Boolean)
    .join(', ');
};

export default function ManualFoundReportScreen() {
  const navigation = useNavigation<ManualFoundReportNav>();
  const formScrollRef = useRef<KeyboardAwareScrollViewRef>(null);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('other');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePublicUrl, setImagePublicUrl] = useState<string | undefined>();
  const [isMapPickerVisible, setIsMapPickerVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region>(DEFAULT_MAP_REGION);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isResolvingMapAddress, setIsResolvingMapAddress] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [searchResults, setSearchResults] = useState<MapAutocompletePrediction[]>([]);
  const mapSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const revealFocusedInput = useCallback(() => {
    // Run once after Android finishes opening the keyboard so multiline inputs
    // are measured against the final visible viewport.
    setTimeout(() => formScrollRef.current?.assureFocusedInputVisible(), 280);
  }, []);

  const pickImage = useCallback(async (source: 'camera' | 'library') => {
    try {
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (perm.status !== 'granted') {
          Alert.alert('Thiếu quyền camera', 'Vui lòng cấp quyền camera để chụp ảnh.');
          return;
        }
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (perm.status !== 'granted') {
          Alert.alert('Thiếu quyền thư viện', 'Vui lòng cấp quyền thư viện để chọn ảnh.');
          return;
        }
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({
              allowsEditing: false,
              quality: 0.8,
            })
          : await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              quality: 0.8,
              mediaTypes: ['images'],
            });

      if (result.canceled || !result.assets[0]?.uri) return;

      const uri = result.assets[0].uri;
      setImageUri(uri);

      // AI phân tích tự động
      setIsAnalyzing(true);
      try {
        const aiResult = await itemsApi.analyzeItemImage(uri);
        setName(aiResult.name);
        setCategory((aiResult.category as ItemCategory) || 'other');
        setImagePublicUrl(aiResult.imagePublicUrl);

        if (aiResult.confidenceScore < 0.5) {
          Alert.alert(
            'AI không chắc chắn',
            `Độ chính xác: ${Math.round(aiResult.confidenceScore * 100)}%. Vui lòng kiểm tra lại thông tin.`
          );
        }
      } catch (err) {
        console.warn('[ManualFoundReport] AI analyze failed:', err);
        // Không block user, vẫn cho nhập tay
      } finally {
        setIsAnalyzing(false);
      }
    } catch (err) {
      console.error('[ManualFoundReport] Pick image error:', err);
      Alert.alert('Không thể mở camera/thư viện', 'Đã xảy ra lỗi khi chọn ảnh. Vui lòng thử lại.');
    }
  }, []);

  const handleChooseImage = useCallback(() => {
    Alert.alert('Thêm hình ảnh', 'Chọn nguồn ảnh đồ vật bạn nhặt được.', [
      { text: 'Chụp ảnh', onPress: () => void pickImage('camera') },
      { text: 'Thư viện', onPress: () => void pickImage('library') },
      { text: 'Huỷ', style: 'cancel' },
    ]);
  }, [pickImage]);

  const handleOpenMapPicker = useCallback(() => {
    Keyboard.dismiss();
    setMapSearchQuery('');
    setSearchResults([]);
    setIsMapPickerVisible(true);

    if (selectedCoordinates) {
      setMapRegion(current => ({ ...current, ...selectedCoordinates }));
      return;
    }

    const centerOnCurrentLocation = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') return;

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          mayShowUserSettingsDialog: true,
        });
        setMapRegion({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
          latitudeDelta: DEFAULT_MAP_REGION.latitudeDelta,
          longitudeDelta: DEFAULT_MAP_REGION.longitudeDelta,
        });
      } catch (error) {
        console.warn('[ManualFoundReport] Cannot center map on current location:', error);
      }
    };

    void centerOnCurrentLocation();
  }, [selectedCoordinates]);

  const handleSearchAddress = useCallback((query: string) => {
    setMapSearchQuery(query);

    if (mapSearchTimeoutRef.current) clearTimeout(mapSearchTimeoutRef.current);

    if (!query.trim()) {
      setSearchResults([]);
      setIsSearchingAddress(false);
      return;
    }

    setIsSearchingAddress(true);
    mapSearchTimeoutRef.current = setTimeout(async () => {
      try {
        const predictions = await mapApi.autocomplete(query.trim());
        setSearchResults(predictions);
      } catch (error) {
        console.warn('[ManualFoundReport] Autocomplete search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 400);
  }, []);

  const handleSelectSearchResult = useCallback(async (item: MapAutocompletePrediction) => {
    Keyboard.dismiss();
    setIsSearchingAddress(true);

    try {
      const details = await mapApi.getPlaceDetails(item.place_id);
      const lat = details?.lat;
      const lng = details?.lng;
      const address = details?.formatted_address || item.description;

      if (typeof lat === 'number' && typeof lng === 'number') {
        setMapRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.006,
          longitudeDelta: 0.006,
        });
      }

      setSearchResults([]);
      setMapSearchQuery(address);
    } catch (error) {
      console.warn('[ManualFoundReport] Get place details failed:', error);
    } finally {
      setIsSearchingAddress(false);
    }
  }, []);

  const handleConfirmMapLocation = useCallback(async () => {
    setIsResolvingMapAddress(true);
    const coordinates = {
      latitude: Number(mapRegion.latitude.toFixed(6)),
      longitude: Number(mapRegion.longitude.toFixed(6)),
    };

    let address = `${coordinates.latitude}, ${coordinates.longitude}`;
    try {
      const reverseResult = await mapApi.reverseGeocode(
        coordinates.latitude,
        coordinates.longitude
      );
      if (reverseResult?.formatted_address) {
        address = reverseResult.formatted_address;
      }
    } catch (error) {
      console.warn('[ManualFoundReport] Reverse geocoding failed:', error);
    } finally {
      setSelectedCoordinates(coordinates);
      setLocationText(address);
      setIsResolvingMapAddress(false);
      setIsMapPickerVisible(false);
    }
  }, [mapRegion]);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên đồ vật.');
      return;
    }

    if (!imageUri) {
      Alert.alert('Thiếu hình ảnh', 'Vui lòng chụp hoặc chọn ảnh đồ vật.');
      return;
    }

    setIsSubmitting(true);
    try {
      const locationDetails = locationText.trim()
        ? [
            `Vị trí nhặt được: ${locationText.trim()}`,
            selectedCoordinates
              ? `Tọa độ: ${selectedCoordinates.latitude}, ${selectedCoordinates.longitude}`
              : '',
          ]
            .filter(Boolean)
            .join('\n')
        : '';
      const persistedDescription = [description.trim(), locationDetails].filter(Boolean).join('\n');

      // Tạo item mới với status sẽ là FOUND
      await itemsApi.createGuardianItem({
        name: name.trim(),
        category,
        imagePublicUrl: imagePublicUrl || '',
        details: {
          color: '',
          storage: '',
          serial: '',
          ai_description: persistedDescription || undefined,
        },
      });

      Alert.alert('Thành công!', 'Đã thêm đồ nhặt được. Cảm ơn bạn đã giúp đỡ!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể gửi báo cáo lúc này.';
      Alert.alert('Gửi thất bại', message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    name,
    imageUri,
    category,
    imagePublicUrl,
    description,
    locationText,
    selectedCoordinates,
    navigation,
  ]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[FIND_BACK.canvas, '#151022', FIND_BACK.neutral]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={21} color={FIND_BACK.bodyText} />
        </Pressable>
        <Text style={styles.headerTitle}>Thêm đồ nhặt được</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAwareScrollView
        ref={formScrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        bottomOffset={60}
        extraKeyboardSpace={30}
      >
        {/* Image Picker */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chọn hình ảnh đồ vật"
          onPress={handleChooseImage}
          style={({ pressed }) => [styles.imagePicker, pressed && styles.imagePickerPressed]}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Camera size={36} color={FIND_BACK.secondary} />
              <Text style={styles.imagePlaceholderText}>Chụp hoặc chọn ảnh đồ vật</Text>
            </View>
          )}
          {isAnalyzing && (
            <View style={styles.analyzeOverlay}>
              <ActivityIndicator size="small" color={FIND_BACK.secondary} />
              <Sparkles size={16} color={FIND_BACK.secondary} />
              <Text style={styles.analyzeText}>AI đang phân tích...</Text>
            </View>
          )}
        </Pressable>

        {/* Tên đồ vật */}
        <View style={styles.fieldGroup}>
          <View style={styles.fieldLabel}>
            <Type size={15} color={FIND_BACK.primaryLight} />
            <Text style={styles.fieldLabelText}>Tên đồ vật</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Ví dụ: iPhone 15, Ví da, Chìa khoá..."
            placeholderTextColor={FIND_BACK.labelText}
            value={name}
            onChangeText={setName}
            maxLength={100}
            multiline={false}
            numberOfLines={1}
          />
        </View>

        {/* Danh mục */}
        <View style={styles.fieldGroup}>
          <View style={styles.fieldLabel}>
            <Tag size={15} color={FIND_BACK.primaryLight} />
            <Text style={styles.fieldLabelText}>Danh mục</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {CATEGORY_OPTIONS.map(opt => (
              <Pressable
                key={opt.value}
                accessibilityRole="button"
                onPress={() => setCategory(opt.value)}
                style={[styles.categoryChip, category === opt.value && styles.categoryChipSelected]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === opt.value && styles.categoryChipTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Mô tả */}
        <View style={styles.fieldGroup}>
          <View style={styles.fieldLabel}>
            <ImageIcon size={15} color={FIND_BACK.primaryLight} />
            <Text style={styles.fieldLabelText}>Mô tả (tuỳ chọn)</Text>
          </View>
          <TextInput
            style={[styles.textInput, styles.textInputMultiline]}
            placeholder="Mô tả thêm đặc điểm đồ vật: màu sắc, kích thước, tình trạng..."
            placeholderTextColor={FIND_BACK.labelText}
            value={description}
            onChangeText={setDescription}
            onFocus={revealFocusedInput}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        {/* Vị trí nhặt được */}
        <View style={styles.fieldGroup}>
          <View style={styles.fieldLabel}>
            <MapPin size={15} color={FIND_BACK.primaryLight} />
            <Text style={styles.fieldLabelText}>Vị trí nhặt được (tuỳ chọn)</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Ví dụ: Sảnh toà A, tầng 1..."
            placeholderTextColor={FIND_BACK.labelText}
            value={locationText}
            onChangeText={setLocationText}
            onFocus={revealFocusedInput}
            maxLength={200}
            multiline={false}
            numberOfLines={1}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Chọn vị trí nhặt được trên bản đồ"
            onPress={handleOpenMapPicker}
            style={({ pressed }) => [styles.mapPickerButton, pressed && styles.buttonPressed]}
          >
            <MapPin size={18} color={FIND_BACK.primaryLight} />
            <Text style={styles.mapPickerButtonText}>Chọn trên bản đồ</Text>
          </Pressable>
          {selectedCoordinates && (
            <Text style={styles.selectedCoordinatesText}>
              Đã ghim: {selectedCoordinates.latitude.toFixed(6)},{' '}
              {selectedCoordinates.longitude.toFixed(6)}
            </Text>
          )}
        </View>
      </KeyboardAwareScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Gửi báo cáo đồ nhặt được"
          onPress={() => void handleSubmit()}
          disabled={isSubmitting || isAnalyzing}
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.submitButtonPressed,
            (isSubmitting || isAnalyzing) && styles.submitButtonDisabled,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={FIND_BACK.neutral} />
          ) : (
            <Send size={20} color={FIND_BACK.neutral} />
          )}
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Đang gửi...' : 'Đăng đồ nhặt được'}
          </Text>
        </Pressable>
      </View>

      <Modal
        visible={isMapPickerVisible}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setIsMapPickerVisible(false)}
      >
        <SafeAreaView style={styles.mapModal} edges={['top', 'bottom']}>
          <View style={styles.mapModalHeader}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Đóng bản đồ"
              onPress={() => setIsMapPickerVisible(false)}
              style={styles.mapModalIconButton}
            >
              <X size={22} color={FIND_BACK.bodyText} />
            </Pressable>
            <View style={styles.mapModalTitleGroup}>
              <Text style={styles.mapModalTitle}>Chọn vị trí nhặt được</Text>
              <Text style={styles.mapModalSubtitle}>Kéo bản đồ để đặt ghim chính xác</Text>
            </View>
            <View style={styles.mapModalHeaderSpacer} />
          </View>

          {/* Search Bar */}
          <View style={styles.mapSearchContainer}>
            <View style={styles.mapSearchInputWrapper}>
              <Search size={18} color={FIND_BACK.mutedText} />
              <TextInput
                style={styles.mapSearchInput}
                placeholder="Tìm kiếm địa chỉ..."
                placeholderTextColor={FIND_BACK.labelText}
                value={mapSearchQuery}
                onChangeText={handleSearchAddress}
                returnKeyType="search"
                autoCorrect={false}
              />
              {isSearchingAddress && (
                <ActivityIndicator size="small" color={FIND_BACK.primaryLight} />
              )}
              {!isSearchingAddress && mapSearchQuery.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Xoá tìm kiếm"
                  onPress={() => {
                    setMapSearchQuery('');
                    setSearchResults([]);
                  }}
                  hitSlop={8}
                >
                  <X size={18} color={FIND_BACK.mutedText} />
                </Pressable>
              )}
            </View>
            {searchResults.length > 0 && (
              <ScrollView
                style={styles.mapSearchResults}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
              >
                {searchResults.map((item, index) => (
                  <Pressable
                    key={item.place_id || `${item.description}-${index}`}
                    accessibilityRole="button"
                    onPress={() => void handleSelectSearchResult(item)}
                    style={({ pressed }) => [
                      styles.mapSearchResultItem,
                      pressed && styles.mapSearchResultItemPressed,
                      index < searchResults.length - 1 && styles.mapSearchResultItemBorder,
                    ]}
                  >
                    <MapPin size={16} color={FIND_BACK.primaryLight} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.mapSearchResultMainText} numberOfLines={1}>
                        {item.main_text || item.description}
                      </Text>
                      {item.secondary_text ? (
                        <Text style={styles.mapSearchResultSecondaryText} numberOfLines={1}>
                          {item.secondary_text}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              region={mapRegion}
              onRegionChangeComplete={setMapRegion}
              showsUserLocation
              showsMyLocationButton
              toolbarEnabled={false}
              style={StyleSheet.absoluteFillObject}
            />
            <View pointerEvents="none" style={styles.mapCenterPin}>
              <View style={styles.mapCenterPinCircle}>
                <MapPin size={25} color="#fff" fill="#fff" />
              </View>
              <View style={styles.mapCenterPinTip} />
            </View>
            <View pointerEvents="none" style={styles.mapCoordinateBadge}>
              <Crosshair size={14} color={FIND_BACK.primaryLight} />
              <Text style={styles.mapCoordinateText}>
                {mapRegion.latitude.toFixed(6)}, {mapRegion.longitude.toFixed(6)}
              </Text>
            </View>
          </View>

          <View style={styles.mapModalFooter}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Xác nhận vị trí trên bản đồ"
              disabled={isResolvingMapAddress}
              onPress={() => void handleConfirmMapLocation()}
              style={({ pressed }) => [
                styles.confirmMapButton,
                pressed && styles.buttonPressed,
                isResolvingMapAddress && styles.submitButtonDisabled,
              ]}
            >
              {isResolvingMapAddress ? (
                <ActivityIndicator size="small" color={FIND_BACK.neutral} />
              ) : (
                <Check size={20} color={FIND_BACK.neutral} />
              )}
              <Text style={styles.confirmMapButtonText}>
                {isResolvingMapAddress ? 'Đang lấy địa chỉ...' : 'Xác nhận vị trí'}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: FIND_BACK.canvas,
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FIND_BACK.borderGlass,
    backgroundColor: FIND_BACK.glassBackground,
  },
  headerTitle: {
    color: FIND_BACK.bodyText,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 17,
  },
  headerSpacer: {
    width: 42,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 20,
  },
  // Image Picker
  imagePicker: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: FIND_BACK.borderGlass,
    backgroundColor: FIND_BACK.surfaceMuted,
  },
  imagePickerPressed: {
    opacity: 0.82,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  imagePlaceholderText: {
    color: FIND_BACK.mutedText,
    fontFamily: FONT_FAMILY.medium,
    fontSize: 14,
  },
  analyzeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
  },
  analyzeText: {
    color: FIND_BACK.secondary,
    fontFamily: FONT_FAMILY.medium,
    fontSize: 13,
  },
  // Fields
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldLabelText: {
    color: FIND_BACK.bodyText,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 14,
  },
  textInput: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: FIND_BACK.borderGlass,
    backgroundColor: FIND_BACK.surfaceMuted,
    color: FIND_BACK.bodyText,
    fontFamily: FONT_FAMILY.body,
    fontSize: 15,
  },
  textInputMultiline: {
    height: undefined,
    minHeight: 80,
    paddingVertical: 14,
    textAlignVertical: 'top',
  },
  mapPickerButton: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: `${FIND_BACK.primaryLight}70`,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  mapPickerButtonText: {
    color: FIND_BACK.primaryLight,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 14,
  },
  selectedCoordinatesText: {
    color: FIND_BACK.mutedText,
    fontFamily: FONT_FAMILY.body,
    fontSize: 11,
    textAlign: 'center',
  },
  // Category chips
  categoryList: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FIND_BACK.borderGlass,
    backgroundColor: FIND_BACK.surfaceMuted,
  },
  categoryChipSelected: {
    borderColor: FIND_BACK.secondary,
    backgroundColor: 'rgba(46, 204, 139, 0.15)',
  },
  categoryChipText: {
    color: FIND_BACK.mutedText,
    fontFamily: FONT_FAMILY.medium,
    fontSize: 13,
  },
  categoryChipTextSelected: {
    color: FIND_BACK.secondary,
  },
  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  submitButton: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: FIND_BACK.secondary,
  },
  submitButtonPressed: {
    opacity: 0.82,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: FIND_BACK.neutral,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 15,
  },
  mapModal: {
    flex: 1,
    backgroundColor: FIND_BACK.canvas,
  },
  mapModalHeader: {
    height: 72,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapModalIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FIND_BACK.surfaceMuted,
  },
  mapModalTitleGroup: {
    flex: 1,
    alignItems: 'center',
  },
  mapModalTitle: {
    color: FIND_BACK.bodyText,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
  },
  mapModalSubtitle: {
    marginTop: 2,
    color: FIND_BACK.mutedText,
    fontFamily: FONT_FAMILY.body,
    fontSize: 11,
  },
  mapModalHeaderSpacer: {
    width: 42,
  },
  mapSearchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: FIND_BACK.canvas,
    zIndex: 10,
  },
  mapSearchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: FIND_BACK.borderGlass,
    backgroundColor: FIND_BACK.surfaceMuted,
  },
  mapSearchInput: {
    flex: 1,
    color: FIND_BACK.bodyText,
    fontFamily: FONT_FAMILY.body,
    fontSize: 14,
    paddingVertical: 0,
  },
  mapSearchResults: {
    marginTop: 6,
    maxHeight: 200,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: FIND_BACK.borderGlass,
    backgroundColor: FIND_BACK.surfaceMuted,
    overflow: 'hidden',
  },
  mapSearchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  mapSearchResultItemPressed: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  mapSearchResultItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FIND_BACK.borderGlass,
  },
  mapSearchResultMainText: {
    color: FIND_BACK.bodyText,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 14,
    lineHeight: 19,
  },
  mapSearchResultSecondaryText: {
    color: FIND_BACK.mutedText,
    fontFamily: FONT_FAMILY.body,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  mapCenterPin: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    alignItems: 'center',
    transform: [{ translateX: -24 }, { translateY: -48 }],
  },
  mapCenterPinCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FIND_BACK.primary,
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 8,
  },
  mapCenterPinTip: {
    width: 0,
    height: 0,
    marginTop: -3,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: FIND_BACK.primary,
  },
  mapCoordinateBadge: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: 'rgba(15, 12, 24, 0.9)',
  },
  mapCoordinateText: {
    color: FIND_BACK.bodyText,
    fontFamily: FONT_FAMILY.medium,
    fontSize: 12,
  },
  mapModalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: FIND_BACK.canvas,
  },
  confirmMapButton: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: FIND_BACK.secondary,
  },
  confirmMapButtonText: {
    color: FIND_BACK.neutral,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 15,
  },
});
