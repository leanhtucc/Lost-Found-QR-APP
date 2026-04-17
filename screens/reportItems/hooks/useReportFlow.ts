import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import * as WebBrowser from 'expo-web-browser';
import { itemsApi } from '@services/items';
import { reportsApi } from '@services/reports';
import { REWARD_OPTIONS, REPORT_LOCATION } from '../constants/mockData';
import { ReportItemOption, ReportLocation, ReportStep } from '../types';

const FALLBACK_ADDRESS = '';

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
  id: string;
  itemId?: string;
  name: string;
  category: string;
  description?: string;
  imagePublicUrl?: string;
}): ReportItemOption => {
  const stableItemId = item.itemId || item.id;

  return {
    id: stableItemId,
    name: item.name,
    category: item.category,
    subtitle: item.description?.trim() || 'Vật dụng trong kho của bạn',
    imageUrl:
      item.imagePublicUrl ||
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=60',
    serialNumber: stableItemId.slice(-8).toUpperCase(),
    insured: false,
  };
};

export const useReportFlow = () => {
  const [step, setStep] = useState<ReportStep>(1);
  const [availableItems, setAvailableItems] = useState<ReportItemOption[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResolvingCurrentLocation, setIsResolvingCurrentLocation] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [selectedRewardId, setSelectedRewardId] = useState<string>(
    REWARD_OPTIONS.find(option => option.recommended)?.id ?? REWARD_OPTIONS[0]?.id ?? ''
  );
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<ReportLocation>(REPORT_LOCATION);
  const [manualAddress, setManualAddress] = useState(REPORT_LOCATION.address || '');
  const [showRadarState, setShowRadarState] = useState(false);

  const loadUserItems = useCallback(async () => {
    setIsLoadingItems(true);

    try {
      const response = await itemsApi.getMyVaultItems({ limit: 30, page: 1 });
      const normalizedItems = response.items.map(mapItemToOption);

      if (normalizedItems.length > 0) {
        setAvailableItems(normalizedItems);
        setSelectedItemId(prev => {
          const hasPrevious = normalizedItems.some(item => item.id === prev);
          return hasPrevious ? prev : normalizedItems[0].id;
        });
      } else {
        setAvailableItems([]);
        setSelectedItemId('');
      }
    } catch (error) {
      console.warn('[ReportFlow] Failed to load user vault items.', error);
      setAvailableItems([]);
      setSelectedItemId('');
    } finally {
      setIsLoadingItems(false);
    }
  }, []);

  useEffect(() => {
    void loadUserItems();
  }, [loadUserItems]);

  const selectedItem = useMemo(
    () => availableItems.find(item => item.id === selectedItemId) ?? availableItems[0],
    [availableItems, selectedItemId]
  );

  const selectedReward = useMemo(
    () => REWARD_OPTIONS.find(option => option.id === selectedRewardId) ?? REWARD_OPTIONS[0],
    [selectedRewardId]
  );

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
        const geocoded = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocoded.length > 0) {
          resolvedAddress = toAddressString(geocoded[0]);
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

  useEffect(() => {
    if (!useCurrentLocation) {
      return;
    }

    void resolveCurrentLocation();
  }, [resolveCurrentLocation, useCurrentLocation]);

  const nextStep = () => {
    setStep(prev => (prev < 3 ? ((prev + 1) as ReportStep) : prev));
  };

  const prevStep = () => {
    setStep(prev => (prev > 1 ? ((prev - 1) as ReportStep) : prev));
  };

  const submitReport = useCallback(async () => {
    if (!selectedItemId) {
      Alert.alert('Thiếu dữ liệu', 'Vui lòng chọn vật dụng cần báo mất.');
      return;
    }

    setIsSubmitting(true);

    try {
      let resolvedLocation = selectedLocation;

      if (useCurrentLocation) {
        resolvedLocation = await resolveCurrentLocation();
      }

      const latitude = resolvedLocation?.lat;
      const longitude = resolvedLocation?.lng;

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        Alert.alert('Thiếu vị trí', 'Vui lòng ghim vị trí đánh rơi trước khi gửi báo mất.');
        return;
      }

      const locationPayload = {
        lat: latitude,
        lng: longitude,
        address: manualAddress.trim() || resolvedLocation?.address || '',
      };

      const reportResult = await reportsApi.reportLostItem({
        itemId: selectedItemId,
        location: {
          lat: locationPayload.lat,
          lng: locationPayload.lng,
          address: locationPayload.address,
        },
        bounty: selectedReward?.amount ?? 0,
        paymentMethod: 'VNPAY',
      });

      if (reportResult.paymentUrl) {
        try {
          await WebBrowser.openBrowserAsync(reportResult.paymentUrl);
        } catch (browserError) {
          console.warn('[ReportFlow] Failed to open payment URL:', browserError);
          Alert.alert(
            'Cần thanh toán để kích hoạt radar',
            'Đã tạo báo mất, nhưng chưa mở được trang thanh toán. Vui lòng thử lại trong lịch sử báo mất.'
          );
          return;
        }

        Alert.alert(
          'Đang chờ thanh toán',
          'Hệ thống đã chuyển tới trang thanh toán. Radar sẽ kích hoạt sau khi thanh toán thành công.'
        );
        return;
      }

      setShowRadarState(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể gửi báo mất lúc này.';
      Alert.alert('Gửi báo mất thất bại', message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    manualAddress,
    resolveCurrentLocation,
    selectedItemId,
    selectedLocation,
    selectedReward?.amount,
    useCurrentLocation,
  ]);

  const location = selectedLocation || {
    ...REPORT_LOCATION,
  };

  return {
    step,
    setStep,
    items: availableItems,
    isLoadingItems,
    isSubmitting,
    selectedItemId,
    setSelectedItemId,
    selectedItem,
    selectedRewardId,
    setSelectedRewardId,
    selectedReward,
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
    showRadarState,
    setShowRadarState,
    nextStep,
    prevStep,
    submitReport,
  };
};
