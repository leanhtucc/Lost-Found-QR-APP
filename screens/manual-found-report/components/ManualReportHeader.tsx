import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';
import { FONT_FAMILY } from '@constants/fonts';

interface ManualReportHeaderProps {
  onBack: () => void;
}

export const ManualReportHeader: React.FC<ManualReportHeaderProps> = ({ onBack }) => {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
        onPress={onBack}
        style={styles.backButton}
      >
        <ArrowLeft size={21} color={FIND_BACK.bodyText} />
      </Pressable>
      <Text style={styles.headerTitle}>Thêm đồ nhặt được</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
};

const styles = StyleSheet.create({
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
});
