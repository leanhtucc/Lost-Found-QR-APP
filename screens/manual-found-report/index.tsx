import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Camera,
  ImageIcon,
  MapPin,
  Send,
  Sparkles,
  Tag,
  Type,
} from 'lucide-react-native';
import type { RootStackParamList } from '@navigation/index';
import { FIND_BACK } from '@constants/theme';
import { FONT_FAMILY } from '@constants/fonts';
import { itemsApi } from '@/services/items';
import { CATEGORY_CONFIG, ItemCategory } from '@/types/item';

type ManualFoundReportNav = StackNavigationProp<RootStackParamList, 'ManualFoundReport'>;

const CATEGORY_OPTIONS: { value: ItemCategory; label: string }[] = Object.entries(
  CATEGORY_CONFIG
).map(([key, config]) => ({
  value: key as ItemCategory,
  label: config.label,
}));

export default function ManualFoundReportScreen() {
  const navigation = useNavigation<ManualFoundReportNav>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('other');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePublicUrl, setImagePublicUrl] = useState<string | undefined>();

  const pickImage = useCallback(async (source: 'camera' | 'library') => {
    try {
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (perm.status !== 'granted') {
          Alert.alert('Thiếu quyền camera', 'Vui lòng cấp quyền camera để chụp ảnh.');
          return;
        }
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (perm.status !== 'granted') {
          Alert.alert('Thiếu quyền thư viện', 'Vui lòng cấp quyền thư viện để chọn ảnh.');
          return;
        }
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              quality: 0.8,
              mediaTypes: ['images'],
            })
          : await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              quality: 0.8,
              mediaTypes: ['images'],
            });

      if (result.canceled || !result.assets[0]?.uri) return;

      const uri = result.assets[0].uri;
      setImageUri(uri);

      // AI phân tích tự động
      setIsAnalyzing(true);
      try {
        const aiResult = await itemsApi.analyzeItemImage(uri);
        setName(aiResult.name);
        setCategory((aiResult.category as ItemCategory) || 'other');
        setImagePublicUrl(aiResult.imagePublicUrl);

        if (aiResult.confidenceScore < 0.5) {
          Alert.alert(
            'AI không chắc chắn',
            `Độ chính xác: ${Math.round(aiResult.confidenceScore * 100)}%. Vui lòng kiểm tra lại thông tin.`
          );
        }
      } catch (err) {
        console.warn('[ManualFoundReport] AI analyze failed:', err);
        // Không block user, vẫn cho nhập tay
      } finally {
        setIsAnalyzing(false);
      }
    } catch (err) {
      console.error('[ManualFoundReport] Pick image error:', err);
    }
  }, []);

  const handleChooseImage = useCallback(() => {
    Alert.alert('Thêm hình ảnh', 'Chọn nguồn ảnh đồ vật bạn nhặt được.', [
      { text: 'Chụp ảnh', onPress: () => void pickImage('camera') },
      { text: 'Thư viện', onPress: () => void pickImage('library') },
      { text: 'Huỷ', style: 'cancel' },
    ]);
  }, [pickImage]);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên đồ vật.');
      return;
    }

    if (!imageUri) {
      Alert.alert('Thiếu hình ảnh', 'Vui lòng chụp hoặc chọn ảnh đồ vật.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Tạo item mới với status sẽ là FOUND
      await itemsApi.createGuardianItem({
        name: name.trim(),
        category,
        imagePublicUrl: imagePublicUrl || '',
        details: {
          color: '',
          storage: '',
          serial: '',
          ai_description: description.trim() || undefined,
        },
      });

      Alert.alert('Thành công!', 'Đã thêm đồ nhặt được. Cảm ơn bạn đã giúp đỡ!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể gửi báo cáo lúc này.';
      Alert.alert('Gửi thất bại', message);
    } finally {
      setIsSubmitting(false);
    }
  }, [name, imageUri, category, imagePublicUrl, description, navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[FIND_BACK.canvas, '#151022', FIND_BACK.neutral]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={21} color={FIND_BACK.bodyText} />
        </Pressable>
        <Text style={styles.headerTitle}>Thêm đồ nhặt được</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image Picker */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chọn hình ảnh đồ vật"
          onPress={handleChooseImage}
          style={({ pressed }) => [styles.imagePicker, pressed && styles.imagePickerPressed]}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Camera size={36} color={FIND_BACK.secondary} />
              <Text style={styles.imagePlaceholderText}>Chụp hoặc chọn ảnh đồ vật</Text>
            </View>
          )}
          {isAnalyzing && (
            <View style={styles.analyzeOverlay}>
              <ActivityIndicator size="small" color={FIND_BACK.secondary} />
              <Sparkles size={16} color={FIND_BACK.secondary} />
              <Text style={styles.analyzeText}>AI đang phân tích...</Text>
            </View>
          )}
        </Pressable>

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
          />
        </View>

        {/* Danh mục */}
        <View style={styles.fieldGroup}>
          <View style={styles.fieldLabel}>
            <Tag size={15} color={FIND_BACK.primaryLight} />
            <Text style={styles.fieldLabelText}>Danh mục</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {CATEGORY_OPTIONS.map(opt => (
              <Pressable
                key={opt.value}
                accessibilityRole="button"
                onPress={() => setCategory(opt.value)}
                style={[styles.categoryChip, category === opt.value && styles.categoryChipSelected]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === opt.value && styles.categoryChipTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

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
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        {/* Vị trí nhặt được */}
        <View style={styles.fieldGroup}>
          <View style={styles.fieldLabel}>
            <MapPin size={15} color={FIND_BACK.primaryLight} />
            <Text style={styles.fieldLabelText}>Vị trí nhặt được (tuỳ chọn)</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Ví dụ: Sảnh tầng 1 toà nhà A, ĐH Bách Khoa..."
            placeholderTextColor={FIND_BACK.labelText}
            value={locationText}
            onChangeText={setLocationText}
            maxLength={200}
          />
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Gửi báo cáo đồ nhặt được"
          onPress={() => void handleSubmit()}
          disabled={isSubmitting || isAnalyzing}
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.submitButtonPressed,
            (isSubmitting || isAnalyzing) && styles.submitButtonDisabled,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={FIND_BACK.neutral} />
          ) : (
            <Send size={20} color={FIND_BACK.neutral} />
          )}
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Đang gửi...' : 'Đăng đồ nhặt được'}
          </Text>
        </Pressable>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 20,
  },
  // Image Picker
  imagePicker: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: FIND_BACK.borderGlass,
    backgroundColor: FIND_BACK.surfaceMuted,
  },
  imagePickerPressed: {
    opacity: 0.82,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  imagePlaceholderText: {
    color: FIND_BACK.mutedText,
    fontFamily: FONT_FAMILY.medium,
    fontSize: 14,
  },
  analyzeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
  },
  analyzeText: {
    color: FIND_BACK.secondary,
    fontFamily: FONT_FAMILY.medium,
    fontSize: 13,
  },
  // Fields
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
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: FIND_BACK.borderGlass,
    backgroundColor: FIND_BACK.surfaceMuted,
    color: FIND_BACK.bodyText,
    fontFamily: FONT_FAMILY.body,
    fontSize: 15,
  },
  textInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  // Category chips
  categoryList: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FIND_BACK.borderGlass,
    backgroundColor: FIND_BACK.surfaceMuted,
  },
  categoryChipSelected: {
    borderColor: FIND_BACK.secondary,
    backgroundColor: 'rgba(46, 204, 139, 0.15)',
  },
  categoryChipText: {
    color: FIND_BACK.mutedText,
    fontFamily: FONT_FAMILY.medium,
    fontSize: 13,
  },
  categoryChipTextSelected: {
    color: FIND_BACK.secondary,
  },
  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  submitButton: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: FIND_BACK.secondary,
  },
  submitButtonPressed: {
    opacity: 0.82,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: FIND_BACK.neutral,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 15,
  },
});
