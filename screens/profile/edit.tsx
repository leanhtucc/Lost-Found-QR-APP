import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, User } from 'lucide-react-native';
import { useAuthContext } from '@/contexts/AuthContext';
import { authApi, getApiFieldErrors, type UpdateProfileRequest } from '@/services/auth';
import { uploadApi } from '@/services/upload';
import { FIND_BACK } from '@/constants/theme';
import { SettingsScreenHeader } from './components';

type FieldName = 'displayName' | 'phoneNumber' | 'address' | 'bio';

const ProfileField = ({
  label,
  value,
  onChangeText,
  error,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'phone-pad';
}) => (
  <View className="mb-5">
    <Text className="mb-2 text-sm font-semibold text-fb-muted">{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      keyboardType={keyboardType}
      placeholderTextColor={FIND_BACK.labelText}
      className={`rounded-2xl border bg-fb-surface px-4 text-base text-fb-content ${
        multiline ? 'min-h-28 py-4' : 'h-14'
      } ${error ? 'border-fb-danger' : 'border-fb-border-subtle'}`}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
    {error ? <Text className="mt-1 text-sm text-fb-danger">{error}</Text> : null}
  </View>
);

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, setUser } = useAuthContext();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [address, setAddress] = useState(user?.address || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [photoURL, setPhotoURL] = useState<string | null>(user?.photoURL || null);
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const normalized = useMemo(
    () => ({
      displayName: displayName.trim(),
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      bio: bio.trim(),
    }),
    [address, bio, displayName, phoneNumber]
  );

  const dirty = Boolean(
    user &&
    (normalized.displayName !== user.displayName.trim() ||
      normalized.phoneNumber !== (user.phoneNumber || '') ||
      normalized.address !== (user.address || '') ||
      normalized.bio !== (user.bio || '') ||
      photoURL !== (user.photoURL || null) ||
      localPhoto)
  );

  const clearError = (field: FieldName) =>
    setErrors(previous => ({ ...previous, [field]: undefined }));

  const chooseAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Thiếu quyền truy cập', 'Vui lòng cấp quyền thư viện để chọn ảnh đại diện.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) setLocalPhoto(result.assets[0].uri);
  };

  const validate = () => {
    const next: Partial<Record<FieldName, string>> = {};
    if (normalized.displayName.length < 2 || normalized.displayName.length > 50) {
      next.displayName = 'Tên hiển thị phải có từ 2 đến 50 ký tự.';
    }
    if (normalized.phoneNumber && !/^\+?\d{8,15}$/.test(normalized.phoneNumber)) {
      next.phoneNumber = 'Số điện thoại phải có từ 8 đến 15 chữ số.';
    }
    if (normalized.address.length > 255) next.address = 'Địa chỉ tối đa 255 ký tự.';
    if (normalized.bio.length > 300) next.bio = 'Giới thiệu tối đa 300 ký tự.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (!user || !dirty || !validate()) return;
    setSubmitting(true);
    try {
      let uploadedPhoto = photoURL;
      if (localPhoto) {
        const upload = await uploadApi.uploadImage(localPhoto);
        if (!upload.success || !upload.data?.url)
          throw new Error(upload.message || 'Upload thất bại');
        uploadedPhoto = uploadApi.getImageUrl(upload.data.url);
      }

      const input: UpdateProfileRequest = {
        displayName: normalized.displayName,
        photoURL: uploadedPhoto,
        phoneNumber: normalized.phoneNumber || null,
        address: normalized.address || null,
        bio: normalized.bio || null,
      };
      const response = await authApi.updateProfile(input);
      if (!response.success || !response.data) {
        const fieldErrors = getApiFieldErrors(response);
        if (fieldErrors) setErrors(fieldErrors as Partial<Record<FieldName, string>>);
        throw new Error(response.message || 'Không thể cập nhật hồ sơ.');
      }
      setUser(response.data);
      Alert.alert('Đã lưu', 'Thông tin cá nhân đã được cập nhật.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert(
        'Cập nhật thất bại',
        error instanceof Error ? error.message : 'Vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-fb-neutral">
      <SettingsScreenHeader title="Thông tin cá nhân" onBack={() => navigation.goBack()} />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        bottomOffset={80}
        extraKeyboardSpace={60}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <View className="mb-8 items-center">
          <TouchableOpacity onPress={chooseAvatar} className="relative">
            <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-fb-primary bg-fb-surface">
              {localPhoto || photoURL ? (
                <Image source={{ uri: localPhoto || photoURL || '' }} className="h-full w-full" />
              ) : (
                <User size={44} color={FIND_BACK.mutedText} />
              )}
            </View>
            <View className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full bg-fb-primary">
              <Camera size={17} color="white" />
            </View>
          </TouchableOpacity>
          {localPhoto || photoURL ? (
            <TouchableOpacity
              onPress={() => {
                setLocalPhoto(null);
                setPhotoURL(null);
              }}
              className="mt-3"
            >
              <Text className="text-sm font-semibold text-fb-danger">Xóa ảnh đại diện</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <ProfileField
          label="Tên hiển thị"
          value={displayName}
          onChangeText={value => {
            setDisplayName(value);
            clearError('displayName');
          }}
          error={errors.displayName}
        />
        <ProfileField
          label="Số điện thoại"
          value={phoneNumber}
          keyboardType="phone-pad"
          onChangeText={value => {
            setPhoneNumber(value);
            clearError('phoneNumber');
          }}
          error={errors.phoneNumber}
        />
        <ProfileField
          label="Địa chỉ"
          value={address}
          onChangeText={value => {
            setAddress(value);
            clearError('address');
          }}
          error={errors.address}
        />
        <ProfileField
          label="Giới thiệu"
          value={bio}
          multiline
          onChangeText={value => {
            setBio(value);
            clearError('bio');
          }}
          error={errors.bio}
        />

        <TouchableOpacity
          disabled={!dirty || submitting}
          onPress={() => void save()}
          className={`h-14 items-center justify-center rounded-full ${
            dirty && !submitting ? 'bg-fb-primary' : 'bg-fb-primary/40'
          }`}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-base font-bold text-white">Lưu thay đổi</Text>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
