/**
 * MeetupModal Component
 * Bottom sheet / Modal đề xuất điểm gặp, thời gian và hướng dẫn an toàn
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { X, MapPin, Clock, ShieldCheck, Navigation } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';
import * as Location from 'expo-location';
import MapView, { MapPressEvent, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { DARK_GOOGLE_MAP_STYLE } from '@/constants/googleMapStyle';

interface MeetupModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (params: {
    address: string;
    name?: string;
    latitude: number;
    longitude: number;
    scheduledTime: string;
    notes?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export const MeetupModal: React.FC<MeetupModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [address, setAddress] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isAsap, setIsAsap] = useState(true);
  const [customTime, setCustomTime] = useState('17:30 hôm nay');
  const [notes, setNotes] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);

        // Reverse geocode
        const geocoded = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });

        if (geocoded.length > 0) {
          const item = geocoded[0];
          const fullAddress = [item.streetNumber, item.street, item.district, item.city]
            .filter(Boolean)
            .join(', ');
          setAddress(fullAddress || 'Vị trí hiện tại của bạn');
          setPlaceName('Vị trí hiện tại');
        }
      }
    } catch (err) {
      console.warn('Get current location error:', err);
    } finally {
      setIsLocating(false);
    }
  };

  const handleMapPress = async (event: MapPressEvent) => {
    const coordinate = event.nativeEvent.coordinate;
    setLatitude(coordinate.latitude);
    setLongitude(coordinate.longitude);
    setPlaceName('Điểm hẹn đã ghim');

    try {
      const [result] = await Location.reverseGeocodeAsync(coordinate);
      if (result) {
        const resolvedAddress = [
          result.name,
          result.street,
          result.district,
          result.city,
          result.region,
        ]
          .filter(Boolean)
          .join(', ');
        setAddress(
          resolvedAddress || `${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`
        );
      }
    } catch {
      setAddress(`${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`);
    }
  };

  const handleSubmit = async () => {
    if (!address.trim() || latitude == null || longitude == null) return;

    await onSubmit({
      name: placeName.trim() || undefined,
      address: address.trim(),
      latitude,
      longitude,
      scheduledTime: isAsap ? 'Ngay bây giờ (Càng sớm càng tốt)' : customTime,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end bg-black/70"
      >
        <View className="max-h-[88%] rounded-t-3xl border-t border-fb-border-subtle bg-fb-surface">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-fb-border-subtle px-5 py-4">
            <View>
              <Text className="text-lg font-bold text-fb-content">Thống nhất điểm gặp</Text>
              <Text className="text-xs text-fb-muted">
                Chọn địa điểm an toàn, thuận tiện cả 2 bên
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-xl bg-fb-surface-elevated"
            >
              <X size={20} color={FIND_BACK.mutedText} />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
            {/* Manual Location Input */}
            <Text className="text-xs font-semibold uppercase tracking-wider text-fb-label mb-1.5">
              Địa điểm cụ thể
            </Text>
            <View className="mb-3">
              <View className="flex-row items-center rounded-xl border border-fb-border-subtle bg-fb-surface-elevated px-3 py-1">
                <MapPin size={18} color={FIND_BACK.mutedText} />
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Nhập địa chỉ hoặc tên địa điểm..."
                  placeholderTextColor={FIND_BACK.labelText}
                  className="flex-1 px-2.5 py-2.5 text-sm text-fb-content"
                />
              </View>

              <TouchableOpacity
                onPress={handleUseCurrentLocation}
                disabled={isLocating}
                className="mt-2 flex-row items-center gap-1.5 self-start py-1"
              >
                {isLocating ? (
                  <ActivityIndicator size="small" color={FIND_BACK.primary} />
                ) : (
                  <Navigation size={14} color={FIND_BACK.primary} />
                )}
                <Text className="text-xs font-semibold text-fb-primary">
                  {isLocating ? 'Đang lấy tọa độ...' : 'Dùng vị trí hiện tại của tôi'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Compact map picker */}
            {latitude != null && longitude != null ? (
              <View className="mb-4 h-44 overflow-hidden rounded-2xl border border-fb-border-subtle">
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={StyleSheet.absoluteFillObject}
                  region={{
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  customMapStyle={DARK_GOOGLE_MAP_STYLE}
                  showsUserLocation={false}
                  showsMyLocationButton={false}
                  toolbarEnabled={false}
                  onPress={handleMapPress}
                >
                  <Marker coordinate={{ latitude, longitude }}>
                    <View className="h-9 w-9 items-center justify-center rounded-2xl border-2 border-white bg-fb-primary">
                      <MapPin size={18} color="#fff" fill="#fff" />
                    </View>
                  </Marker>
                </MapView>
                <View
                  pointerEvents="none"
                  className="absolute bottom-2 left-2 rounded-full bg-fb-neutral/90 px-3 py-1.5"
                >
                  <Text className="text-[10px] font-semibold text-fb-content">
                    Chạm bản đồ để đặt ghim
                  </Text>
                </View>
              </View>
            ) : (
              <View className="mb-4 h-28 items-center justify-center rounded-2xl border border-fb-border-subtle bg-fb-surface-elevated px-6">
                <Text className="text-center text-xs text-fb-muted">
                  Dùng vị trí hiện tại để mở bản đồ, sau đó chạm vào điểm gặp chính xác.
                </Text>
              </View>
            )}

            {/* Time Selection */}
            <Text className="text-xs font-semibold uppercase tracking-wider text-fb-label mb-1.5">
              Thời gian gặp
            </Text>
            <View className="flex-row gap-2 mb-3">
              <TouchableOpacity
                onPress={() => setIsAsap(true)}
                className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl border py-2.5 ${
                  isAsap
                    ? 'border-fb-primary bg-fb-primary/15'
                    : 'border-fb-border-subtle bg-fb-surface-elevated'
                }`}
              >
                <Clock size={16} color={isAsap ? FIND_BACK.primary : FIND_BACK.mutedText} />
                <Text
                  className={`text-xs font-bold ${
                    isAsap ? 'text-fb-primary-light' : 'text-fb-muted'
                  }`}
                >
                  Gặp ngay (ASAP)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsAsap(false)}
                className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl border py-2.5 ${
                  !isAsap
                    ? 'border-fb-primary bg-fb-primary/15'
                    : 'border-fb-border-subtle bg-fb-surface-elevated'
                }`}
              >
                <Clock size={16} color={!isAsap ? FIND_BACK.primary : FIND_BACK.mutedText} />
                <Text
                  className={`text-xs font-bold ${
                    !isAsap ? 'text-fb-primary-light' : 'text-fb-muted'
                  }`}
                >
                  Chọn giờ hẹn
                </Text>
              </TouchableOpacity>
            </View>

            {!isAsap && (
              <TextInput
                value={customTime}
                onChangeText={setCustomTime}
                placeholder="VD: 18:00 hôm nay, 8:00 sáng mai..."
                placeholderTextColor={FIND_BACK.labelText}
                className="mb-3 rounded-xl border border-fb-border-subtle bg-fb-surface-elevated px-3 py-2.5 text-sm text-fb-content"
              />
            )}

            {/* Notes */}
            <Text className="text-xs font-semibold uppercase tracking-wider text-fb-label mb-1.5">
              Ghi chú thêm (Tùy chọn)
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="VD: Tôi mặc áo khoác đen, đứng cạnh quầy thu ngân..."
              placeholderTextColor={FIND_BACK.labelText}
              className="mb-4 rounded-xl border border-fb-border-subtle bg-fb-surface-elevated px-3 py-2.5 text-sm text-fb-content"
            />

            {/* Privacy & Safety Guarantee */}
            <View className="mb-6 flex-row gap-2.5 rounded-xl border border-fb-primary/20 bg-fb-primary/5 p-3">
              <ShieldCheck size={18} color={FIND_BACK.primary} />
              <View className="flex-1">
                <Text className="text-xs font-bold text-fb-primary-light">
                  Quyền riêng tư & An toàn
                </Text>
                <Text className="mt-0.5 text-[11px] leading-relaxed text-fb-muted">
                  Vị trí Live Map chỉ được kích hoạt khi cả hai cùng chấp thuận và có thể dừng chia
                  sẻ bất cứ lúc nào. Nên hẹn tại nơi công cộng có ánh sáng và đông người.
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!address.trim() || latitude == null || longitude == null || isLoading}
              className={`mb-6 items-center justify-center rounded-2xl py-3.5 ${
                address.trim() && latitude != null && longitude != null && !isLoading
                  ? 'bg-fb-primary'
                  : 'bg-fb-surface-elevated opacity-50'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-base font-bold text-white">Gửi đề xuất điểm gặp</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
