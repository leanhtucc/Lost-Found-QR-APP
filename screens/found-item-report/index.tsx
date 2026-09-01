import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Camera, ImagePlus, QrCode, ShieldCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '@navigation/index';
import { FIND_BACK } from '@constants/theme';
import { FONT_FAMILY } from '@constants/fonts';

type FoundItemNavigation = StackNavigationProp<RootStackParamList, 'FoundItemReport'>;

export default function FoundItemReportScreen() {
  const navigation = useNavigation<FoundItemNavigation>();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[FIND_BACK.canvas, '#151022', FIND_BACK.neutral]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={21} color={FIND_BACK.bodyText} />
        </Pressable>
        <Text style={styles.headerTitle}>Đồ nhặt được</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.heroIcon}>
          <Camera size={34} color={FIND_BACK.secondary} />
        </View>
        <Text style={styles.title}>Thêm đồ bạn vừa nhặt được</Text>
        <Text style={styles.subtitle}>
          Nếu vật dụng có mã FindBack, hãy quét QR. Nếu không có QR, bạn vẫn có thể đăng bài để tìm
          chủ sở hữu.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quét mã QR trên vật dụng"
          onPress={() => navigation.navigate('Scan')}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
        >
          <QrCode size={22} color={FIND_BACK.neutral} />
          <Text style={styles.primaryButtonText}>Quét QR trên vật dụng</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Đăng đồ nhặt được không cần QR"
          onPress={() => navigation.navigate('ManualFoundReport')}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
        >
          <ImagePlus size={22} color={FIND_BACK.secondary} />
          <Text style={styles.secondaryButtonText}>Không có mã QR</Text>
        </Pressable>

        <View style={styles.infoCard}>
          <ShieldCheck size={20} color={FIND_BACK.primaryLight} />
          <Text style={styles.infoText}>
            Thông tin của bạn được ẩn. Phòng chat chỉ được tạo khi mã QR thuộc vật dụng đang LOST.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: FIND_BACK.canvas,
  },
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  heroIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(46, 204, 139, 0.14)',
  },
  title: {
    marginTop: 22,
    color: FIND_BACK.bodyText,
    fontFamily: FONT_FAMILY.display,
    fontSize: 31,
    lineHeight: 39,
  },
  subtitle: {
    marginTop: 12,
    color: FIND_BACK.mutedText,
    fontFamily: FONT_FAMILY.body,
    fontSize: 15,
    lineHeight: 23,
  },
  primaryButton: {
    marginTop: 30,
    height: 58,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: FIND_BACK.secondary,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  secondaryButton: {
    marginTop: 12,
    height: 58,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: `${FIND_BACK.secondary}52`,
    backgroundColor: 'rgba(46, 204, 139, 0.1)',
  },
  secondaryButtonText: {
    color: FIND_BACK.secondary,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 15,
  },
  primaryButtonText: {
    color: FIND_BACK.neutral,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 15,
  },
  infoCard: {
    marginTop: 18,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: FIND_BACK.borderGlass,
    backgroundColor: FIND_BACK.glassBackground,
  },
  infoText: {
    flex: 1,
    color: FIND_BACK.mutedText,
    fontFamily: FONT_FAMILY.body,
    fontSize: 13,
    lineHeight: 20,
  },
});
