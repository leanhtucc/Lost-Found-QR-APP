import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '@navigation/index';
import { MAP_PREVIEW_IMAGE, REWARD_OPTIONS } from './constants/mockData';
import { REPORT_COLORS, REPORT_LAYOUT } from './constants/theme';
import { useReportFlow } from './hooks/useReportFlow';
import {
  ActionFooter,
  ItemSelectionStep,
  LocationStep,
  RadarStatusModal,
  ReportHeader,
  RewardStep,
  StepIndicator,
} from './components';

type ReportItemsNavigationProp = StackNavigationProp<RootStackParamList>;

export default function ReportItemsScreen() {
  const navigation = useNavigation<ReportItemsNavigationProp>();
  const insets = useSafeAreaInsets();

  const {
    step,
    items,
    isLoadingItems,
    isSubmitting,
    selectedItemId,
    setSelectedItemId,
    selectedRewardId,
    setSelectedRewardId,
    location,
    manualAddress,
    setManualAddress,
    useCurrentLocation,
    setUseCurrentLocation,
    isResolvingCurrentLocation,
    showRadarState,
    setShowRadarState,
    nextStep,
    prevStep,
    submitReport,
  } = useReportFlow();

  const footerLabel = useMemo(() => (step === 3 ? 'Báo mất ngay' : 'Tiếp theo'), [step]);

  const handleBack = () => {
    if (showRadarState) {
      setShowRadarState(false);
      return;
    }

    if (step === 1) {
      navigation.goBack();
      return;
    }

    prevStep();
  };

  const handlePrimaryAction = () => {
    if (step < 3) {
      nextStep();
      return;
    }

    submitReport();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={[REPORT_COLORS.background, '#0f0b1a']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <ReportHeader
        title="Báo mất vật dụng"
        onBack={handleBack}
        rightLabel={step === 3 ? 'GUARDIAN' : undefined}
      />

      <View style={styles.indicatorWrap}>{step > 1 ? <StepIndicator step={step} /> : null}</View>

      <ScrollView
        style={styles.contentWrap}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? (
          <ItemSelectionStep
            items={items}
            selectedItemId={selectedItemId}
            onSelectItem={setSelectedItemId}
            isLoading={isLoadingItems}
          />
        ) : null}

        {step === 2 ? (
          <LocationStep
            mapImageUri={MAP_PREVIEW_IMAGE}
            location={location}
            manualAddress={manualAddress}
            onChangeManualAddress={setManualAddress}
            useCurrentLocation={useCurrentLocation}
            onToggleUseCurrentLocation={() => setUseCurrentLocation(prev => !prev)}
            isResolvingCurrentLocation={isResolvingCurrentLocation}
          />
        ) : null}

        {step === 3 ? (
          <RewardStep
            rewards={REWARD_OPTIONS}
            selectedRewardId={selectedRewardId}
            onSelectReward={setSelectedRewardId}
          />
        ) : null}
      </ScrollView>

      <ActionFooter
        label={isSubmitting ? 'Đang gửi...' : footerLabel}
        onPress={handlePrimaryAction}
        bottomInset={insets.bottom}
        disabled={isSubmitting}
      />

      <RadarStatusModal visible={showRadarState} onClose={() => setShowRadarState(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: REPORT_COLORS.background,
  },
  glowTop: {
    position: 'absolute',
    top: 120,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(124, 58, 237, 0.22)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: 160,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(196, 181, 253, 0.12)',
  },
  indicatorWrap: {
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: REPORT_LAYOUT.horizontalPadding,
  },
  contentWrap: {
    flex: 1,
    paddingHorizontal: REPORT_LAYOUT.horizontalPadding,
  },
  contentContainer: {
    paddingBottom: 24,
  },
});
