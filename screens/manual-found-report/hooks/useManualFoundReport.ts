import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import type { Region } from 'react-native-maps';
import { mapApi, MapAutocompletePrediction } from '@/services/map';
import { itemsApi } from '@/services/items';
import { uploadApi } from '@/services/upload';
import { foundReportsApi } from '@/services/reports/found';
import type { ItemCategory } from '@/types/item';
import { DEFAULT_MAP_REGION, toAddressString } from '../constants/options';
import type {
  LocationCoordinates,
  ManualFoundReportNav,
  UseManualFoundReportReturn,
} from '../types';

export function useManualFoundReport(): UseManualFoundReportReturn {
  const navigation = useNavigation<ManualFoundReportNav>();
  const formScrollRef = useRef<any>(null);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('other');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInFlightRef = useRef(false);
  const reportKeyRef = useRef<string | null>(null);
  const [imagePublicUrl, setImagePublicUrl] = useState<string | undefined>();
  const [isMapPickerVisible, setIsMapPickerVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region>(DEFAULT_MAP_REGION);
  const [selectedCoordinates, setSelectedCoordinates] = useState<LocationCoordinates | null>(null);
  const [isResolvingCurrentLocation, setIsResolvingCurrentLocation] = useState(false);
  const [isResolvingMapAddress, setIsResolvingMapAddress] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [searchResults, setSearchResults] = useState<MapAutocompletePrediction[]>([]);
  const mapSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasValidLocation =
    locationText.trim().length > 0 &&
    selectedCoordinates !== null &&
    Number.isFinite(selectedCoordinates.latitude) &&
    Math.abs(selectedCoordinates.latitude) <= 90 &&
    Number.isFinite(selectedCoordinates.longitude) &&
    Math.abs(selectedCoordinates.longitude) <= 180;

  const canSubmit =
    Boolean(name.trim() && imageUri && hasValidLocation) &&
    !isSubmitting &&
    !isAnalyzing &&
    !isResolvingMapAddress &&
    !isResolvingCurrentLocation;

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
      setImagePublicUrl(undefined);

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

  const fetchCurrentLocation = useCallback(async (isSilent = false) => {
    setIsResolvingCurrentLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!isSilent) {
          Alert.alert(
            'Thiếu quyền vị trí',
            'Vui lòng cấp quyền truy cập vị trí trong cài đặt thiết bị để lấy vị trí hiện tại.'
          );
        }
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: Number(position.coords.latitude.toFixed(6)),
        longitude: Number(position.coords.longitude.toFixed(6)),
      };

      let address = `${coords.latitude}, ${coords.longitude}`;
      try {
        const reverseResult = await mapApi.reverseGeocode(coords.latitude, coords.longitude);
        if (reverseResult?.formatted_address) {
          address = reverseResult.formatted_address;
        } else {
          const [geo] = await Location.reverseGeocodeAsync(coords);
          if (geo) {
            const formatted = toAddressString(geo);
            if (formatted) address = formatted;
          }
        }
      } catch (err) {
        console.warn('[ManualFoundReport] Reverse geocode failed:', err);
      }

      setSelectedCoordinates(coords);
      setLocationText(address);
      setMapRegion(prev => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));
    } catch (err) {
      console.warn('[ManualFoundReport] Get current position failed:', err);
      if (!isSilent) {
        Alert.alert('Lỗi định vị', 'Không thể lấy vị trí hiện tại. Vui lòng chọn trên bản đồ.');
      }
    } finally {
      setIsResolvingCurrentLocation(false);
    }
  }, []);

  useEffect(() => {
    void Location.getForegroundPermissionsAsync().then(({ status }) => {
      if (status === 'granted') {
        void fetchCurrentLocation(true);
      }
    });
  }, [fetchCurrentLocation]);

  const handleLocationTextBlur = useCallback(async () => {
    const query = locationText.trim();
    if (!query) return;
    if (selectedCoordinates) return;

    try {
      const results = await Location.geocodeAsync(query);
      if (results.length > 0) {
        const first = results[0];
        const coords = {
          latitude: Number(first.latitude.toFixed(6)),
          longitude: Number(first.longitude.toFixed(6)),
        };
        setSelectedCoordinates(coords);
        setMapRegion(prev => ({
          ...prev,
          latitude: coords.latitude,
          longitude: coords.longitude,
        }));
      }
    } catch (err) {
      console.warn('[ManualFoundReport] Geocode on blur failed:', err);
    }
  }, [locationText, selectedCoordinates]);

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
    if (
      submitInFlightRef.current ||
      isAnalyzing ||
      isResolvingMapAddress ||
      isResolvingCurrentLocation
    )
      return;

    if (!name.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên đồ vật nhặt được.');
      return;
    }

    if (!imageUri) {
      Alert.alert('Thiếu hình ảnh', 'Vui lòng chụp hoặc chọn ảnh đồ vật nhặt được.');
      return;
    }

    if (!hasValidLocation || !selectedCoordinates) {
      Alert.alert(
        'Thiếu vị trí nhặt được',
        'Vui lòng bấm "Vị trí hiện tại" hoặc "Chọn trên bản đồ" để xác nhận điểm nhặt được đồ.'
      );
      return;
    }

    submitInFlightRef.current = true;
    setIsSubmitting(true);
    try {
      let uploadedImageUrl = imagePublicUrl;
      if (!uploadedImageUrl) {
        const upload = await uploadApi.uploadImage(imageUri);
        if (!upload.success || !upload.data?.url) {
          throw new Error(upload.message || 'Không thể tải ảnh lên. Vui lòng thử lại.');
        }
        uploadedImageUrl = uploadApi.getImageUrl(upload.data.url);
        setImagePublicUrl(uploadedImageUrl);
      }
      reportKeyRef.current ??= foundReportsApi.createKey();
      await foundReportsApi.create({
        idempotencyKey: reportKeyRef.current,
        name: name.trim(),
        category,
        imagePublicUrl: uploadedImageUrl,
        description: description.trim(),
        location: {
          lat: selectedCoordinates.latitude,
          lng: selectedCoordinates.longitude,
          address: locationText.trim(),
        },
      });

      Alert.alert(
        'Đăng thành công',
        'Bài đăng đồ nhặt được đã được lưu. Bạn có thể xem trên trang chủ.',
        [
          {
            text: 'Về trang chủ',
            onPress: () => navigation.navigate('TabNavigator', { screen: 'Home' }),
          },
        ]
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể gửi báo cáo lúc này.';
      Alert.alert('Gửi thất bại', message);
    } finally {
      submitInFlightRef.current = false;
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
    hasValidLocation,
    isAnalyzing,
    isResolvingMapAddress,
    isResolvingCurrentLocation,
  ]);

  return {
    navigation,
    formScrollRef,
    imageUri,
    name,
    category,
    description,
    locationText,
    selectedCoordinates,
    imagePublicUrl,
    isAnalyzing,
    isSubmitting,
    isResolvingCurrentLocation,
    isResolvingMapAddress,
    hasValidLocation,
    canSubmit,
    setName,
    setCategory,
    setDescription,
    setLocationText,
    handleChooseImage,
    fetchCurrentLocation,
    handleLocationTextBlur,
    handleSubmit,
    revealFocusedInput,
    isMapPickerVisible,
    setIsMapPickerVisible,
    mapRegion,
    setMapRegion,
    mapSearchQuery,
    isSearchingAddress,
    searchResults,
    handleOpenMapPicker,
    handleSearchAddress,
    handleSelectSearchResult,
    handleConfirmMapLocation,
    setMapSearchQuery,
    setSearchResults,
  };
}
