import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Check, Crosshair, MapPin, Search, X } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';
import { FONT_FAMILY } from '@constants/fonts';
import type { MapAutocompletePrediction } from '@/services/map';

interface MapPickerModalProps {
  visible: boolean;
  mapRegion: Region;
  mapSearchQuery: string;
  isSearchingAddress: boolean;
  searchResults: MapAutocompletePrediction[];
  isResolvingMapAddress: boolean;
  onClose: () => void;
  onRegionChangeComplete: (region: Region) => void;
  onSearchAddress: (query: string) => void;
  onSelectSearchResult: (item: MapAutocompletePrediction) => void;
  onConfirmLocation: () => void;
  onClearSearch: () => void;
}

export const MapPickerModal: React.FC<MapPickerModalProps> = ({
  visible,
  mapRegion,
  mapSearchQuery,
  isSearchingAddress,
  searchResults,
  isResolvingMapAddress,
  onClose,
  onRegionChangeComplete,
  onSearchAddress,
  onSelectSearchResult,
  onConfirmLocation,
  onClearSearch,
}) => {
  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <SafeAreaView style={styles.mapModal} edges={['top', 'bottom']}>
        <View style={styles.mapModalHeader}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đóng bản đồ"
            onPress={onClose}
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
              onChangeText={onSearchAddress}
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
                onPress={onClearSearch}
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
                  onPress={() => onSelectSearchResult(item)}
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
            onRegionChangeComplete={onRegionChangeComplete}
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
            onPress={onConfirmLocation}
            style={({ pressed }) => [
              styles.confirmMapButton,
              pressed && styles.buttonPressed,
              isResolvingMapAddress && styles.buttonDisabled,
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
  );
};

const styles = StyleSheet.create({
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
  buttonPressed: {
    opacity: 0.82,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
