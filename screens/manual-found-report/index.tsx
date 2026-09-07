import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { ImageIcon, Type } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';
import { FONT_FAMILY } from '@constants/fonts';
import {
  CategorySelector,
  ImagePickerSection,
  LocationSection,
  ManualReportHeader,
  MapPickerModal,
  SubmitFooter,
} from './components';
import { useManualFoundReport } from './hooks/useManualFoundReport';

export default function ManualFoundReportScreen() {
  const {
    navigation,
    formScrollRef,
    imageUri,
    name,
    category,
    description,
    locationText,
    selectedCoordinates,
    isAnalyzing,
    isSubmitting,
    isResolvingCurrentLocation,
    isResolvingMapAddress,
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
  } = useManualFoundReport();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[FIND_BACK.canvas, '#151022', FIND_BACK.neutral]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <ManualReportHeader onBack={() => navigation.goBack()} />

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
        <ImagePickerSection
          imageUri={imageUri}
          isAnalyzing={isAnalyzing}
          onChooseImage={handleChooseImage}
        />

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
        <CategorySelector category={category} onSelectCategory={setCategory} />

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
        <LocationSection
          locationText={locationText}
          selectedCoordinates={selectedCoordinates}
          isResolvingCurrentLocation={isResolvingCurrentLocation}
          onLocationTextChange={setLocationText}
          onLocationTextBlur={() => void handleLocationTextBlur()}
          onFetchCurrentLocation={() => void fetchCurrentLocation(false)}
          onOpenMapPicker={handleOpenMapPicker}
          onFocusInput={revealFocusedInput}
        />
      </KeyboardAwareScrollView>

      {/* Submit Button */}
      <SubmitFooter
        isSubmitting={isSubmitting}
        isDisabled={
          isSubmitting || isAnalyzing || isResolvingMapAddress || isResolvingCurrentLocation
        }
        canSubmit={canSubmit}
        onSubmit={() => void handleSubmit()}
      />

      {/* Map Picker Modal */}
      <MapPickerModal
        visible={isMapPickerVisible}
        mapRegion={mapRegion}
        mapSearchQuery={mapSearchQuery}
        isSearchingAddress={isSearchingAddress}
        searchResults={searchResults}
        isResolvingMapAddress={isResolvingMapAddress}
        onClose={() => setIsMapPickerVisible(false)}
        onRegionChangeComplete={setMapRegion}
        onSearchAddress={handleSearchAddress}
        onSelectSearchResult={item => void handleSelectSearchResult(item)}
        onConfirmLocation={() => void handleConfirmMapLocation()}
        onClearSearch={() => {
          setMapSearchQuery('');
          setSearchResults([]);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: FIND_BACK.canvas,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 20,
  },
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
});
