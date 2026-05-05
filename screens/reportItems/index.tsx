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
  PaymentWebViewModal,
  RadarStep,
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
    isCreatingItem,
    isSubmitting,
    isSimulatingRadar,
    selectedItemId,
    setSelectedItemId,
    selectionSummary,
    isFetchingSelectionSummary,
    selectedRewardId,
    setSelectedRewardId,
    customRewardAmount,
    setCustomRewardAmount,
    radarSimulation,
    location,
    manualAddress,
    setManualAddress,
    useCurrentLocation,
    setUseCurrentLocation,
    isResolvingCurrentLocation,
    paymentSession,
    closePaymentModal,
    handlePaymentSuccess,
    handlePaymentCancel,
    handleAddNewItem,
    refreshRadarSimulation,
    showRadarState,
    setShowRadarState,
    nextStep,
    prevStep,
    submitReport,
  } = useReportFlow();

  const footerLabel = useMemo(() => (step === 4 ? 'Báo mất ngay' : 'Tiếp theo'), [step]);

  const hasSelectedItem = useMemo(
    () => items.some(item => item.id === selectedItemId),
    [items, selectedItemId]
  );

  const isPrimaryDisabled = useMemo(() => {
    if (isSubmitting) {
      return true;
    }

    if (step === 1) {
      return isLoadingItems || isCreatingItem || !hasSelectedItem;
    }

    if (step === 2) {
      return isSimulatingRadar;
    }

    if (step === 3) {
      return useCurrentLocation && isResolvingCurrentLocation;
    }

    return false;
  }, [
    isCreatingItem,
    hasSelectedItem,
    isLoadingItems,
    isResolvingCurrentLocation,
    isSimulatingRadar,
    isSubmitting,
    step,
    useCurrentLocation,
  ]);

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
    if (step < 4) {
      void nextStep();
      return;
    }

    void submitReport();
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
        rightLabel={step === 4 ? 'GUARDIAN' : undefined}
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
            onAddNewItem={handleAddNewItem}
            isLoading={isLoadingItems}
            isCreatingItem={isCreatingItem}
            selectionSummary={selectionSummary}
            isFetchingSelectionSummary={isFetchingSelectionSummary}
          />
        ) : null}

        {step === 2 ? (
          <RadarStep
            simulation={radarSimulation}
            isLoading={isSimulatingRadar}
            onRetry={() => {
              void refreshRadarSimulation();
            }}
          />
        ) : null}

        {step === 3 ? (
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

        {step === 4 ? (
          <RewardStep
            rewards={REWARD_OPTIONS}
            selectedRewardId={selectedRewardId}
            onSelectReward={setSelectedRewardId}
            customRewardAmount={customRewardAmount}
            onChangeCustomRewardAmount={setCustomRewardAmount}
          />
        ) : null}
      </ScrollView>

      <ActionFooter
        label={isSubmitting ? 'Đang gửi...' : footerLabel}
        onPress={handlePrimaryAction}
        bottomInset={insets.bottom}
        disabled={isPrimaryDisabled}
      />

      <RadarStatusModal
        visible={showRadarState}
        onClose={() => setShowRadarState(false)}
        activeUsersCount={radarSimulation.activeUsersCount}
        radius={radarSimulation.recommendedRadius}
        durationHours={radarSimulation.estimatedDurationHours}
      />

      <PaymentWebViewModal
        visible={paymentSession.visible}
        paymentUrl={paymentSession.paymentUrl}
        onClose={closePaymentModal}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentCancel={handlePaymentCancel}
      />
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
