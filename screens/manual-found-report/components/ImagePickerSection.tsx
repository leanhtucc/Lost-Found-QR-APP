import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera, Sparkles } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';
import { FONT_FAMILY } from '@constants/fonts';

interface ImagePickerSectionProps {
  imageUri: string | null;
  isAnalyzing: boolean;
  onChooseImage: () => void;
}

export const ImagePickerSection: React.FC<ImagePickerSectionProps> = ({
  imageUri,
  isAnalyzing,
  onChooseImage,
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Chọn hình ảnh đồ vật"
      onPress={onChooseImage}
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
  );
};

const styles = StyleSheet.create({
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
});
