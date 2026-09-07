import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Crosshair, MapPin } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';
import { FONT_FAMILY } from '@constants/fonts';
import type { LocationCoordinates } from '../types';

interface LocationSectionProps {
  locationText: string;
  selectedCoordinates: LocationCoordinates | null;
  isResolvingCurrentLocation: boolean;
  onLocationTextChange: (text: string) => void;
  onLocationTextBlur: () => void;
  onFetchCurrentLocation: () => void;
  onOpenMapPicker: () => void;
  onFocusInput: () => void;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  locationText,
  selectedCoordinates,
  isResolvingCurrentLocation,
  onLocationTextChange,
  onLocationTextBlur,
  onFetchCurrentLocation,
  onOpenMapPicker,
  onFocusInput,
}) => {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.fieldLabel}>
        <MapPin size={15} color={FIND_BACK.primaryLight} />
        <Text style={styles.fieldLabelText}>Vị trí nhặt được (bắt buộc)</Text>
      </View>
      <TextInput
        style={styles.textInput}
        placeholder="Nhập địa chỉ hoặc toà nhà, tầng..."
        placeholderTextColor={FIND_BACK.labelText}
        value={locationText}
        onChangeText={onLocationTextChange}
        onBlur={onLocationTextBlur}
        onFocus={onFocusInput}
        maxLength={200}
        multiline={false}
        numberOfLines={1}
      />
      <View style={styles.locationButtonRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lấy vị trí hiện tại"
          onPress={onFetchCurrentLocation}
          disabled={isResolvingCurrentLocation}
          style={({ pressed }) => [
            styles.currentLocationButton,
            pressed && styles.buttonPressed,
            isResolvingCurrentLocation && styles.buttonDisabled,
          ]}
        >
          {isResolvingCurrentLocation ? (
            <ActivityIndicator size="small" color={FIND_BACK.secondary} />
          ) : (
            <Crosshair size={16} color={FIND_BACK.secondary} />
          )}
          <Text style={styles.currentLocationButtonText}>
            {isResolvingCurrentLocation ? 'Đang định vị...' : 'Vị trí hiện tại'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chọn vị trí nhặt được trên bản đồ"
          onPress={onOpenMapPicker}
          style={({ pressed }) => [styles.mapPickerButton, pressed && styles.buttonPressed]}
        >
          <MapPin size={16} color={FIND_BACK.primaryLight} />
          <Text style={styles.mapPickerButtonText}>Chọn trên bản đồ</Text>
        </Pressable>
      </View>

      {!selectedCoordinates && (
        <Text style={styles.unselectedCoordinatesText}>
          ⚠️ Bắt buộc: Bấm &apos;Vị trí hiện tại&apos; hoặc &apos;Chọn trên bản đồ&apos; trước khi
          đăng.
        </Text>
      )}
      {selectedCoordinates && (
        <Text style={styles.selectedCoordinatesText}>
          ✓ Đã ghim: {selectedCoordinates.latitude.toFixed(6)},{' '}
          {selectedCoordinates.longitude.toFixed(6)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  locationButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  currentLocationButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: `${FIND_BACK.secondary}60`,
    backgroundColor: 'rgba(46, 204, 139, 0.12)',
  },
  currentLocationButtonText: {
    color: FIND_BACK.secondary,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 14,
  },
  mapPickerButton: {
    flex: 1,
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
  buttonPressed: {
    opacity: 0.82,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  unselectedCoordinatesText: {
    color: '#f87171',
    fontFamily: FONT_FAMILY.medium,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  selectedCoordinatesText: {
    color: FIND_BACK.secondary,
    fontFamily: FONT_FAMILY.medium,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
});
