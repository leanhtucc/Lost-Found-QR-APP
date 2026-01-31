import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, User, CheckCircle2 } from 'lucide-react-native';
import { uploadApi, validateFile } from '@services/upload';

interface AvatarPickerProps {
  /** The uploaded photo URL (from server) */
  value: string | null;
  /** Called with the server URL after successful upload, or null when removed */
  onChange: (photoURL: string | null) => void;
  /** Error message to display */
  error?: string;
  /** If true, skip upload and just return local URI (for preview purposes) */
  skipUpload?: boolean;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  value,
  onChange,
  error,
  skipUpload = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const requestPermission = async (type: 'camera' | 'gallery') => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Yêu cầu quyền truy cập',
          'Ứng dụng cần quyền truy cập camera để chụp ảnh đại diện.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Yêu cầu quyền truy cập',
          'Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh đại diện.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    }
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      setIsLoading(true);
      setUploadProgress('Đang chọn ảnh...');

      const hasPermission = await requestPermission(source);
      if (!hasPermission) {
        setIsLoading(false);
        setUploadProgress('');
        return;
      }

      let result: ImagePicker.ImagePickerResult;

      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const localUri = asset.uri;

        // Validate file before upload
        const validation = validateFile(localUri, asset.fileSize, asset.mimeType || undefined);
        if (!validation.isValid) {
          Alert.alert('Lỗi', validation.error || 'File không hợp lệ');
          setIsLoading(false);
          setUploadProgress('');
          return;
        }

        // Set local preview immediately for better UX
        setLocalPreview(localUri);

        if (skipUpload) {
          // Just return local URI without uploading
          onChange(localUri);
        } else {
          // Upload to server
          setUploadProgress('Đang tải ảnh lên...');

          const uploadResponse = await uploadApi.uploadImage(localUri);

          if (uploadResponse.success && uploadResponse.data) {
            // Get full URL and pass to parent
            const fullUrl = uploadApi.getImageUrl(uploadResponse.data.url);
            onChange(fullUrl);
            setUploadProgress('');
          } else {
            // Upload failed
            setLocalPreview(null);
            Alert.alert('Lỗi tải ảnh', uploadResponse.message || 'Không thể tải ảnh lên server');
            setUploadProgress('');
          }
        }
      } else {
        setUploadProgress('');
      }
    } catch (err) {
      console.error('Error picking/uploading image:', err);
      setLocalPreview(null);
      Alert.alert('Lỗi', 'Không thể chọn hoặc tải ảnh. Vui lòng thử lại.');
      setUploadProgress('');
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = () => {
    onChange(null);
    setLocalPreview(null);
  };

  // Display image: prefer server URL, fallback to local preview
  const displayImage = value || localPreview;

  const handlePress = () => {
    if (value) {
      // If already has image, show options
      // Note: On Android, buttons are displayed in reverse order (last item at top)
      Alert.alert('Ảnh đại diện', 'Chọn hành động', [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa ảnh',
          onPress: removeImage,
          style: 'destructive',
        },
        {
          text: 'Chọn từ thư viện',
          onPress: () => pickImage('gallery'),
        },
        {
          text: 'Chụp ảnh mới',
          onPress: () => pickImage('camera'),
        },
      ]);
    } else {
      // If no image, show picker options
      // Note: On Android, buttons are displayed in reverse order (last item at top)
      Alert.alert('Chọn ảnh đại diện', undefined, [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Chọn từ thư viện',
          onPress: () => pickImage('gallery'),
        },
        {
          text: 'Chụp ảnh',
          onPress: () => pickImage('camera'),
        },
      ]);
    }
  };

  return (
    <View className="items-center mb-2">
      {/* Avatar Container */}
      <TouchableOpacity
        className={`relative ${error ? 'border-2 border-red-500 rounded-full' : ''}`}
        onPress={handlePress}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {/* Gradient Border */}
        <View className="w-[120px] h-[120px] rounded-full p-[3px] bg-gray-200 shadow-md shadow-blue-500/20">
          <View className="flex-1 rounded-full bg-gray-50 justify-center items-center overflow-hidden">
            {isLoading ? (
              <View className="items-center justify-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                {uploadProgress ? (
                  <Text className="text-[10px] text-blue-500 mt-1.5 text-center font-medium">
                    {uploadProgress}
                  </Text>
                ) : null}
              </View>
            ) : displayImage ? (
              <>
                <Image source={{ uri: displayImage }} className="w-full h-full rounded-full" />
                {/* Success Badge - only show when upload is complete (has value) */}
                {value && (
                  <View className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white justify-center items-center shadow-sm">
                    <CheckCircle2 size={18} color="#FFFFFF" fill="#22c55e" />
                  </View>
                )}
              </>
            ) : (
              <View className="items-center px-2.5">
                <View className="w-14 h-14 rounded-full bg-gray-100 justify-center items-center mb-1.5">
                  <User size={32} color="#9CA3AF" />
                </View>
                <Text className="text-[11px] font-medium text-gray-500 text-center">
                  Thêm ảnh đại diện
                </Text>
                <Text className="text-[9px] text-gray-400 mt-0.5">(Không bắt buộc)</Text>
              </View>
            )}
          </View>
        </View>

        {/* Camera Icon Badge */}
        {!isLoading && (
          <View className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-blue-500 justify-center items-center border-[3px] border-white shadow-md">
            <Camera size={16} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>

      {/* Error Message */}
      {error && <Text className="text-red-500 text-xs mt-2 text-center">{error}</Text>}
    </View>
  );
};
