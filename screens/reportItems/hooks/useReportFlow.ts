import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import {
  AnalyzeItemImageResult,
  EligibleForReportItem,
  itemsApi,
  SelectionSummaryResponse,
} from '@services/items';
import { uploadApi } from '@/services/upload';
import { mapApi } from '@/services/map';
import { radarApi } from '@services/radar';
import { reportsApi, ReportsApiError } from '@services/reports';
import type { Item, ItemCategory } from '@/types/item';
import { REWARD_OPTIONS, REPORT_LOCATION } from '../constants/mockData';
import {
  RadarSimulationState,
  ReportItemOption,
  ReportLocation,
  ReportStep,
  RewardOption,
} from '../types';

const FALLBACK_ADDRESS = '';
const DEFAULT_RADAR_RADIUS = 500;
const DEFAULT_RADAR_DURATION_HOURS = 24;

const DEFAULT_RADAR_SIMULATION: RadarSimulationState = {
  activeUsersCount: 0,
  recommendedRadius: DEFAULT_RADAR_RADIUS,
  estimatedDurationHours: DEFAULT_RADAR_DURATION_HOURS,
  simulatedLat: REPORT_LOCATION.lat,
  simulatedLng: REPORT_LOCATION.lng,
};

const FALLBACK_REPORT_ITEM_IMAGE =
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=60';

interface PaymentSessionState {
  visible: boolean;
  paymentUrl: string;
  reportId: string;
}

const toAddressString = (location: Location.LocationGeocodedAddress): string => {
  const segments = [
    location.name,
    location.streetNumber,
    location.street,
    location.district,
    location.city,
    location.region,
    location.country,
  ];

  return segments
    .map(segment => (typeof segment === 'string' ? segment.trim() : ''))
    .filter(Boolean)
    .join(', ');
};

const toLocationView = (latitude: number, longitude: number, address: string): ReportLocation => {
  const normalizedAddress = address.trim();
  const fallbackTitle = `Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)}`;

  if (!normalizedAddress) {
    return {
      title: fallbackTitle,
      subtitle: 'Vị trí ghim hiện tại',
      cityLine: 'Không xác định rõ địa chỉ',
      lat: latitude,
      lng: longitude,
      address: FALLBACK_ADDRESS,
    };
  }

  const parts = normalizedAddress
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
  const title = parts.slice(0, 2).join(', ') || normalizedAddress;
  const cityLine = parts.slice(2).join(', ') || normalizedAddress;

  return {
    title,
    subtitle: 'Vị trí ghim hiện tại',
    cityLine,
    lat: latitude,
    lng: longitude,
    address: normalizedAddress,
  };
};

const mapItemToOption = (item: {
  item_id: string;
  name: string;
  category: string;
  image_url: string | null;
  details: {
    color: string | null;
    storage: string | null;
    serial: string | null;
  };
  has_insurance: boolean;
}): ReportItemOption => {
  const itemId = String(item.item_id || '').trim();
  const color = item.details.color?.trim() || '';
  const storage = item.details.storage?.trim() || '';
  const serial = item.details.serial?.trim() || '';

  const detailSegments = [color, storage].filter(Boolean);

  return {
    id: itemId,
    itemId,
    name: item.name?.trim() || 'Vật phẩm chưa đặt tên',
    category: (item.category?.trim() || 'other').toUpperCase(),
    subtitle: detailSegments.length > 0 ? detailSegments.join(' · ') : 'Chưa có chi tiết kỹ thuật',
    imageUrl: item.image_url || FALLBACK_REPORT_ITEM_IMAGE,
    details: {
      color,
      storage,
      serial,
    },
    hasInsurance: Boolean(item.has_insurance),
    status: 'SAFE',
    isEligible: true,
  };
};

const mapVaultItemToOption = (
  item: Item,
  eligibleItems: Awaited<ReturnType<typeof itemsApi.getEligibleForReportItems>>,
  hasEligibleList = true
): ReportItemOption => {
  const matchingEligibleItem = eligibleItems.find(candidate => {
    return candidate.item_id === item.id || candidate.item_id === item.itemId;
  });
  const reportItemId = matchingEligibleItem?.item_id || item.id;

  const isEligible = hasEligibleList
    ? Boolean(matchingEligibleItem)
    : item.status === 'SAFE' || item.status !== 'LOST';

  return {
    id: reportItemId,
    itemId: reportItemId,
    name: item.name?.trim() || 'Vật phẩm chưa đặt tên',
    category: (item.category || 'other').toUpperCase(),
    subtitle: item.description?.trim() || 'Vật dụng trong kho của bạn',
    imageUrl: item.imagePublicUrl || FALLBACK_REPORT_ITEM_IMAGE,
    details: {
      color: '',
      storage: '',
      serial: item.itemId?.slice(-8).toUpperCase() || '',
    },
    hasInsurance: false,
    status: item.status,
    isEligible,
  };
};

const sanitizeRewardAmount = (value: number): number => {
  const normalized = Number.isFinite(value) ? Math.floor(value) : 0;
  return Math.max(0, normalized);
};

const getRewardById = (rewardId: string): RewardOption | undefined => {
  return REWARD_OPTIONS.find(option => option.id === rewardId);
};

export const useReportFlow = () => {
  const [step, setStep] = useState<ReportStep>(1);
  const [availableItems, setAvailableItems] = useState<ReportItemOption[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [itemsLoadError, setItemsLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSimulatingRadar, setIsSimulatingRadar] = useState(false);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [isResolvingCurrentLocation, setIsResolvingCurrentLocation] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [selectionSummary, setSelectionSummary] = useState<SelectionSummaryResponse | null>(null);
  const [isFetchingSelectionSummary, setIsFetchingSelectionSummary] = useState(false);
  const [selectedRewardId, setSelectedRewardId] = useState<string>(
    REWARD_OPTIONS.find(option => option.recommended)?.id ?? REWARD_OPTIONS[0]?.id ?? ''
  );
  const [customRewardAmount, setCustomRewardAmount] = useState(100000);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<ReportLocation>(REPORT_LOCATION);
  const [manualAddress, setManualAddress] = useState(REPORT_LOCATION.address || '');
  const [radarSimulation, setRadarSimulation] =
    useState<RadarSimulationState>(DEFAULT_RADAR_SIMULATION);
  const [paymentSession, setPaymentSession] = useState<PaymentSessionState>({
    visible: false,
    paymentUrl: '',
    reportId: '',
  });
  const [showRadarState, setShowRadarState] = useState(false);
  const [localImages, setLocalImages] = useState<Record<string, string>>({});

  const loadUserItems = useCallback(async (): Promise<ReportItemOption[]> => {
    console.log('[useReportFlow] Starting loadUserItems...');
    setIsLoadingItems(true);
    setItemsLoadError(null);

    try {
      const [eligibleItems, firstPage] = await Promise.all([
        itemsApi.getEligibleForReportItems().catch(error => {
          console.warn('[useReportFlow] Eligible items endpoint unavailable, fallback:', error);
          return [] as EligibleForReportItem[];
        }),
        itemsApi.getItems({ page: 1, limit: 50 }),
      ]);
      const allVaultItems = [...firstPage.items];

      for (let page = 2; page <= firstPage.totalPages; page += 1) {
        const nextPage = await itemsApi.getItems({ page, limit: 50 });
        allVaultItems.push(...nextPage.items);
      }

      const hasEligibleList = eligibleItems.length > 0;
      const normalizedItems = allVaultItems.map(item =>
        mapVaultItemToOption(item, eligibleItems, hasEligibleList)
      );
      const knownItemIds = new Set(
        allVaultItems.flatMap(item => [item.id, item.itemId].filter(Boolean))
      );

      eligibleItems.forEach(item => {
        if (!knownItemIds.has(item.item_id)) {
          normalizedItems.push(mapItemToOption(item));
        }
      });

      if (normalizedItems.length > 0) {
        console.log(`[useReportFlow] Loaded ${normalizedItems.length} items from eligible API.`);
        setAvailableItems(normalizedItems);
        setSelectedItemId(prev => {
          const hasPrevious = normalizedItems.some(item => item.id === prev && item.isEligible);
          const nextSelected = hasPrevious
            ? prev
            : normalizedItems.find(item => item.isEligible)?.id || '';
          console.log(`[useReportFlow] Setting selectedItemId to: ${nextSelected}`);
          return nextSelected;
        });
      } else {
        console.log('[useReportFlow] No items from eligible API.');
        setAvailableItems([]);
        setSelectedItemId('');
      }

      return normalizedItems;
    } catch (error) {
      console.warn('[ReportFlow] Failed to load eligible report items.', error);
      const message = error instanceof Error ? error.message : 'Không thể tải kho đồ lúc này.';
      setItemsLoadError(message);
      setAvailableItems([]);
      setSelectedItemId('');
      return [];
    } finally {
      setIsLoadingItems(false);
    }
  }, []);

  useEffect(() => {
    void loadUserItems();
  }, [loadUserItems]);

  const itemsToDisplay = useMemo(() => {
    return availableItems.map(item => {
      // Override with local image if we have one (usually from just taking a photo)
      if (localImages[item.id]) {
        return { ...item, imageUrl: localImages[item.id] };
      }
      return item;
    });
  }, [availableItems, localImages]);

  const selectedItem = useMemo(
    () => itemsToDisplay.find(item => item.id === selectedItemId),
    [itemsToDisplay, selectedItemId]
  );

  useEffect(() => {
    let isMounted = true;
    console.log(`[useReportFlow] selectedItemId changed: ${selectedItemId}`);

    if (!selectedItemId) {
      setSelectionSummary(null);
      return;
    }

    const fetchSummary = async () => {
      setIsFetchingSelectionSummary(true);
      try {
        const summary = await itemsApi.getSelectionSummary(selectedItemId);
        if (isMounted) {
          setSelectionSummary(summary);
        }
      } catch (error) {
        console.warn('[useReportFlow] Failed to fetch selection summary', error);
        if (isMounted) {
          setSelectionSummary(null);
        }
      } finally {
        if (isMounted) {
          setIsFetchingSelectionSummary(false);
        }
      }
    };

    void fetchSummary();

    return () => {
      isMounted = false;
    };
  }, [selectedItemId]);

  const selectedReward = useMemo(
    () => getRewardById(selectedRewardId) ?? REWARD_OPTIONS[0],
    [selectedRewardId]
  );

  const resolveRadarCoordinates = useCallback(async (): Promise<{ lat: number; lng: number }> => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status === 'granted') {
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        return {
          lat: Number(current.coords.latitude.toFixed(6)),
          lng: Number(current.coords.longitude.toFixed(6)),
        };
      }
    } catch (error) {
      console.warn('[ReportFlow] Failed to resolve radar coordinates from GPS:', error);
    }

    return {
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
    };
  }, [selectedLocation.lat, selectedLocation.lng]);

  const simulateRadar = useCallback(async (): Promise<void> => {
    setIsSimulatingRadar(true);

    try {
      const coordinates = await resolveRadarCoordinates();
      const simulation = await radarApi.simulateGuardianRadar({
        lat: coordinates.lat,
        lng: coordinates.lng,
        radius: DEFAULT_RADAR_RADIUS,
      });

      setRadarSimulation({
        activeUsersCount: simulation.activeUsersCount,
        recommendedRadius: simulation.recommendedRadius,
        estimatedDurationHours: simulation.estimatedDurationHours,
        simulatedLat: coordinates.lat,
        simulatedLng: coordinates.lng,
      });
    } catch (error) {
      console.warn('[ReportFlow] Failed to simulate radar:', error);
      Alert.alert(
        'Không thể mô phỏng radar',
        'Tạm dùng thông số mặc định để tiếp tục tạo báo mất.'
      );
      setRadarSimulation(previous => ({
        ...previous,
        recommendedRadius: previous.recommendedRadius || DEFAULT_RADAR_RADIUS,
        estimatedDurationHours: previous.estimatedDurationHours || DEFAULT_RADAR_DURATION_HOURS,
      }));
    } finally {
      setIsSimulatingRadar(false);
    }
  }, [resolveRadarCoordinates]);

  const resolveCurrentLocation = useCallback(async (): Promise<ReportLocation | null> => {
    setIsResolvingCurrentLocation(true);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Thiếu quyền vị trí', 'Vui lòng cấp quyền vị trí để tự động điền địa chỉ.');
        return null;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const latitude = Number(current.coords.latitude.toFixed(6));
      const longitude = Number(current.coords.longitude.toFixed(6));

      let resolvedAddress = FALLBACK_ADDRESS;

      try {
        const reverseResult = await mapApi.reverseGeocode(latitude, longitude);
        if (reverseResult?.formatted_address) {
          resolvedAddress = reverseResult.formatted_address;
        }
      } catch (error) {
        console.warn('[ReportFlow] Reverse geocoding failed:', error);
      }

      const nextLocation = toLocationView(latitude, longitude, resolvedAddress);
      setSelectedLocation(nextLocation);
      setManualAddress(nextLocation.address || FALLBACK_ADDRESS);

      return nextLocation;
    } catch (error) {
      console.warn('[ReportFlow] Failed to resolve current location:', error);
      Alert.alert('Lỗi vị trí', 'Không thể lấy vị trí hiện tại. Bạn có thể nhập địa chỉ thủ công.');
      return null;
    } finally {
      setIsResolvingCurrentLocation(false);
    }
  }, []);

  const handleMapLocationChange = useCallback(async (lat: number, lng: number) => {
    // Update coordinates immediately so the submit flow can use them
    setSelectedLocation(prev => ({ ...prev, lat, lng }));

    // Reverse geocode in the background via Google Maps API
    try {
      const reverseResult = await mapApi.reverseGeocode(lat, lng);
      if (reverseResult?.formatted_address) {
        const nextLocation = toLocationView(lat, lng, reverseResult.formatted_address);
        setSelectedLocation(nextLocation);
        setManualAddress(nextLocation.address || FALLBACK_ADDRESS);
      }
    } catch {
      // Geocoding failure is non-critical; coordinates are already saved
    }
  }, []);

  useEffect(() => {
    if (!useCurrentLocation) {
      return;
    }

    void resolveCurrentLocation();
  }, [resolveCurrentLocation, useCurrentLocation]);

  const nextStep = useCallback(async () => {
    if (step === 1) {
      const canReportSelectedItem = availableItems.some(
        item => item.id === selectedItemId && item.isEligible
      );
      if (!canReportSelectedItem) {
        Alert.alert('Chưa chọn đồ', 'Vui lòng chọn một vật dụng SAFE có thể báo mất.');
        return;
      }

      await simulateRadar();
      setStep(2);
      return;
    }

    if (step < 4) {
      setStep(prev => (prev < 4 ? ((prev + 1) as ReportStep) : prev));
    }
  }, [availableItems, selectedItemId, simulateRadar, step]);

  const prevStep = useCallback(() => {
    setStep(prev => (prev > 1 ? ((prev - 1) as ReportStep) : prev));
  }, []);

  const submitReport = useCallback(async () => {
    const hasValidSelectedItem = availableItems.some(
      item => item.id === selectedItemId && item.isEligible
    );

    if (!selectedItemId || !hasValidSelectedItem) {
      Alert.alert('Thiếu dữ liệu', 'Vui lòng chọn vật dụng cần báo mất.');
      return;
    }

    setIsSubmitting(true);

    try {
      let resolvedLocation: ReportLocation | null = selectedLocation;

      if (useCurrentLocation) {
        resolvedLocation = await resolveCurrentLocation();
      }

      const latitude = resolvedLocation?.lat ?? selectedLocation.lat;
      const longitude = resolvedLocation?.lng ?? selectedLocation.lng;

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        Alert.alert('Thiếu vị trí', 'Vui lòng ghim vị trí đánh rơi trước khi gửi báo mất.');
        return;
      }

      const locationPayload = {
        lat: latitude,
        lng: longitude,
        address: manualAddress.trim() || resolvedLocation?.address || '',
      };

      const isCustomReward = Boolean(selectedReward?.isCustom);
      const baseAmount = sanitizeRewardAmount(
        isCustomReward ? customRewardAmount : selectedReward?.amount || 0
      );

      if (baseAmount < 10000) {
        Alert.alert('Mức thưởng chưa hợp lệ', 'Mức thưởng tối thiểu là 10.000đ.');
        return;
      }

      const reportResult = await reportsApi.createGuardianReport({
        itemId: selectedItemId,
        location: {
          lat: locationPayload.lat,
          lng: locationPayload.lng,
          address: locationPayload.address,
        },
        radar: {
          radius: radarSimulation.recommendedRadius,
          durationHours: radarSimulation.estimatedDurationHours,
        },
        reward: {
          baseAmount,
          isCustom: isCustomReward,
        },
      });

      setPaymentSession({
        visible: true,
        paymentUrl: reportResult.paymentUrl,
        reportId: reportResult.reportId,
      });
    } catch (error) {
      const isNoLongerEligible =
        error instanceof ReportsApiError &&
        (error.status === 409 || error.code === 'ITEM_NOT_ELIGIBLE');

      if (isNoLongerEligible) {
        setStep(1);
        await loadUserItems();
        Alert.alert(
          'Vật dụng không còn đủ điều kiện',
          'Vật dụng này đã được báo mất hoặc đang có giao dịch Guardian. Vui lòng chọn vật dụng khác.'
        );
        return;
      }

      const message = error instanceof Error ? error.message : 'Không thể gửi báo mất lúc này.';
      Alert.alert('Gửi báo mất thất bại', message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    availableItems,
    loadUserItems,
    manualAddress,
    resolveCurrentLocation,
    customRewardAmount,
    selectedItemId,
    selectedLocation,
    selectedReward?.amount,
    selectedReward?.isCustom,
    radarSimulation.estimatedDurationHours,
    radarSimulation.recommendedRadius,
    useCurrentLocation,
  ]);

  const closePaymentModal = useCallback(() => {
    setPaymentSession({
      visible: false,
      paymentUrl: '',
      reportId: '',
    });
  }, []);

  const handlePaymentSuccess = useCallback(
    (_url: string) => {
      closePaymentModal();
      Alert.alert(
        'Đã nhận kết quả thanh toán',
        `Hệ thống đang xác minh thanh toán cho báo mất #${paymentSession.reportId}. Radar sẽ chỉ hoạt động sau khi backend xác nhận giao dịch.`
      );
    },
    [closePaymentModal, paymentSession.reportId]
  );

  const handlePaymentCancel = useCallback(
    (_url: string) => {
      closePaymentModal();
      Alert.alert('Thanh toán bị huỷ', 'Bạn có thể quay lại và thanh toán lại bất kỳ lúc nào.');
    },
    [closePaymentModal]
  );

  const runAddItemFlow = useCallback(
    async (source: 'camera' | 'library') => {
      console.log(`[useReportFlow] Starting runAddItemFlow with source: ${source}`);
      setIsCreatingItem(true);

      try {
        if (source === 'camera') {
          const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
          if (cameraPermission.status !== 'granted') {
            Alert.alert('Thiếu quyền camera', 'Vui lòng cấp quyền camera để chụp ảnh vật phẩm.');
            return;
          }
        } else {
          const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (libraryPermission.status !== 'granted') {
            Alert.alert(
              'Thiếu quyền thư viện',
              'Vui lòng cấp quyền thư viện để chọn ảnh vật phẩm.'
            );
            return;
          }
        }

        const pickerResult =
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

        if (pickerResult.canceled || !pickerResult.assets[0]?.uri) {
          return;
        }

        const imageUri = pickerResult.assets[0].uri;

        // Thử AI phân tích, có fallback an toàn nếu lỗi mạng / route
        let aiResult: AnalyzeItemImageResult | null = null;
        try {
          aiResult = await itemsApi.analyzeItemImage(imageUri);
          if (typeof aiResult.confidenceScore === 'number' && aiResult.confidenceScore < 0.5) {
            Alert.alert(
              'AI không chắc chắn',
              `Độ chính xác AI: ${Math.round(aiResult.confidenceScore * 100)}%. Vui lòng kiểm tra lại thông tin vật phẩm.`
            );
          }
        } catch (aiError) {
          console.warn('[useReportFlow] AI analyze failed or unavailable, fallback:', aiError);
        }

        // Upload ảnh lấy public URL nếu AI không trả về
        let publicImageUrl = aiResult?.imagePublicUrl;
        if (!publicImageUrl) {
          try {
            const uploadRes = await uploadApi.uploadImage(imageUri);
            if (uploadRes.success && uploadRes.data?.url) {
              publicImageUrl = uploadApi.getImageUrl(uploadRes.data.url);
            }
          } catch (uploadError) {
            console.warn('[useReportFlow] Upload fallback failed:', uploadError);
          }
        }

        const itemName = aiResult?.name?.trim() || 'Vật phẩm mới';
        const itemCategory = (aiResult?.category as ItemCategory) || 'other';

        const createdItem = await itemsApi.createGuardianItem({
          name: itemName,
          category: itemCategory,
          imagePublicUrl: publicImageUrl || '',
          details: {
            color: aiResult?.details.color || '',
            storage: aiResult?.details.storage || '',
            model: '',
            serial: aiResult?.details.serial || '',
            imei: '',
            ai_visual_tags: aiResult?.details.ai_visual_tags || [],
            ai_description: aiResult?.details.ai_description || '',
          },
          hasInsurance: false,
        });

        console.log('[useReportFlow] Data vật phẩm báo cáo mới (createdItem):', createdItem);

        const refreshedItems = await loadUserItems();
        // V2: dùng qrCodeId (không phải itemId) để khớp với list returned bởi eligible-for-report
        const hasCreatedItem = refreshedItems.some(
          item => item.id === createdItem.itemId || item.id === createdItem.qrCodeId
        );
        console.log(
          `[useReportFlow] Item created successfully. Has created item in refreshed list: ${hasCreatedItem}`
        );

        if (hasCreatedItem) {
          // Ưu tiên itemId (id nội bộ) vì list dùng item_id từ backend
          const targetId =
            refreshedItems.find(
              item => item.id === createdItem.itemId || item.id === createdItem.qrCodeId
            )?.id ?? createdItem.itemId;

          console.log(`[useReportFlow] Auto-selecting new item: ${targetId}`);
          setSelectedItemId(targetId);

          setLocalImages(prev => ({
            ...prev,
            [targetId]: imageUri,
            [createdItem.itemId]: imageUri,
            [createdItem.qrCodeId]: imageUri,
          }));
        }

        Alert.alert(
          'Đã thêm vật phẩm mới',
          hasCreatedItem
            ? `Đã thêm "${createdItem.name}" và tự động chọn cho bạn.`
            : `Đã thêm "${createdItem.name}".`
        );
      } catch (error) {
        console.error('[useReportFlow] Error adding new item:', error);
        const message = error instanceof Error ? error.message : 'Không thể thêm vật phẩm mới.';
        Alert.alert('Thêm vật phẩm thất bại', message);
      } finally {
        setIsCreatingItem(false);
      }
    },
    [loadUserItems]
  );

  const handleAddNewItem = useCallback(() => {
    Alert.alert('Thêm mới vật phẩm', 'Chọn nguồn ảnh để AI phân tích nhanh vật phẩm.', [
      {
        text: 'Chụp ảnh',
        onPress: () => {
          void runAddItemFlow('camera');
        },
      },
      {
        text: 'Thư viện',
        onPress: () => {
          void runAddItemFlow('library');
        },
      },
      {
        text: 'Huỷ',
        style: 'cancel',
      },
    ]);
  }, [runAddItemFlow]);

  const location = selectedLocation;

  return {
    step,
    setStep,
    items: itemsToDisplay,
    isLoadingItems,
    itemsLoadError,
    reloadEligibleItems: loadUserItems,
    isCreatingItem,
    isSubmitting,
    isSimulatingRadar,
    selectedItemId,
    setSelectedItemId,
    selectedItem,
    selectionSummary,
    isFetchingSelectionSummary,
    selectedRewardId,
    setSelectedRewardId,
    selectedReward,
    customRewardAmount,
    setCustomRewardAmount,
    radarSimulation,
    location,
    manualAddress,
    setManualAddress,
    useCurrentLocation,
    setUseCurrentLocation: (value: boolean | ((previous: boolean) => boolean)) => {
      setUseCurrentLocation(previous => {
        const next = typeof value === 'function' ? value(previous) : value;
        if (!next) {
          setIsResolvingCurrentLocation(false);
        }
        return next;
      });
    },
    isResolvingCurrentLocation,
    paymentSession,
    closePaymentModal,
    handlePaymentSuccess,
    handlePaymentCancel,
    handleAddNewItem,
    handleMapLocationChange,
    refreshRadarSimulation: simulateRadar,
    showRadarState,
    setShowRadarState,
    nextStep,
    prevStep,
    submitReport,
  };
};
