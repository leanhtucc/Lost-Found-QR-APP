import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Bell, Globe, Mail, MapPin, Radar } from 'lucide-react-native';
import { useAuthContext } from '@/contexts/AuthContext';
import { authStorage } from '@/storage/auth';
import {
  authApi,
  getApiFieldErrors,
  type ProfilePreferences,
  type UpdateProfilePreferencesRequest,
} from '@/services/auth';
import { AppToggle } from '@/components';
import { FIND_BACK } from '@/constants/theme';
import { SettingsScreenHeader } from './components';

const RADII = [100, 500, 1000, 3000, 5000];

const formatRadius = (value: number) =>
  value < 1000 ? `${value} m` : `${Number((value / 1000).toFixed(1))} km`;

export default function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const { user, setUser } = useAuthContext();
  const [preferences, setPreferences] = useState<ProfilePreferences>(
    user?.preferences || {
      pushEnabled: true,
      emailEnabled: false,
      proximityEnabled: true,
      notificationRadiusMeters: 3000,
      language: 'vi',
    }
  );
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const update = async (change: UpdateProfilePreferencesRequest) => {
    if (!user || Object.keys(change).length === 0) return;
    const previous = preferences;
    const next = { ...previous, ...change };
    setPreferences(next);
    setSavingKey(Object.keys(change)[0]);
    const response = await authApi.updatePreferences(change);
    setSavingKey(null);
    if (!response.success || !response.data) {
      setPreferences(previous);
      const fieldError = Object.values(getApiFieldErrors(response) || {})[0];
      Alert.alert('Không thể cập nhật', fieldError || response.message || 'Vui lòng thử lại.');
      return;
    }
    setPreferences(response.data);
    const updatedUser = { ...user, preferences: response.data };
    setUser(updatedUser);
    await authStorage.saveUser(updatedUser);
  };

  const SettingSwitch = ({
    icon: Icon,
    label,
    description,
    value,
    settingKey,
  }: {
    icon: typeof Bell;
    label: string;
    description: string;
    value: boolean;
    settingKey: 'pushEnabled' | 'emailEnabled' | 'proximityEnabled';
  }) => (
    <View className="flex-row items-center border-b border-fb-border-subtle px-4 py-4">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-fb-surface-elevated">
        <Icon size={18} color={FIND_BACK.mutedText} />
      </View>
      <View className="ml-4 flex-1 pr-3">
        <Text className="text-base font-semibold text-fb-content">{label}</Text>
        <Text className="mt-1 text-xs leading-4 text-fb-muted">{description}</Text>
      </View>
      <AppToggle
        disabled={savingKey === settingKey}
        value={value}
        onValueChange={next => void update({ [settingKey]: next })}
        activeTrackColor={FIND_BACK.primary}
        inactiveTrackColor={FIND_BACK.surfaceElevated}
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-fb-neutral">
      <SettingsScreenHeader title="Cài đặt thông báo" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View className="overflow-hidden rounded-3xl bg-fb-surface">
          <SettingSwitch
            icon={Bell}
            label="Thông báo đẩy"
            description="Áp dụng cho toàn bộ thiết bị đăng nhập tài khoản này."
            value={preferences.pushEnabled}
            settingKey="pushEnabled"
          />
          <SettingSwitch
            icon={Mail}
            label="Thông báo email"
            description="Không ảnh hưởng email OTP và cảnh báo bảo mật."
            value={preferences.emailEnabled}
            settingKey="emailEnabled"
          />
          <SettingSwitch
            icon={Radar}
            label="Cảnh báo ở gần"
            description="Nhận cảnh báo khi có đồ thất lạc phù hợp quanh bạn."
            value={preferences.proximityEnabled}
            settingKey="proximityEnabled"
          />
        </View>

        <View
          className={`mt-6 rounded-3xl bg-fb-surface p-4 ${!preferences.proximityEnabled ? 'opacity-50' : ''}`}
        >
          <View className="mb-4 flex-row items-center">
            <MapPin size={18} color={FIND_BACK.info} />
            <View className="ml-3">
              <Text className="text-base font-semibold text-fb-content">Bán kính cảnh báo</Text>
              <Text className="mt-1 text-xs text-fb-muted">Áp dụng cho cảnh báo mới</Text>
            </View>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {RADII.map(radius => {
              const selected = preferences.notificationRadiusMeters === radius;
              return (
                <TouchableOpacity
                  key={radius}
                  disabled={
                    !preferences.proximityEnabled || savingKey === 'notificationRadiusMeters'
                  }
                  onPress={() => void update({ notificationRadiusMeters: radius })}
                  className={`rounded-full border px-4 py-2 ${
                    selected
                      ? 'border-fb-primary bg-fb-primary'
                      : 'border-fb-border-subtle bg-fb-surface-elevated'
                  }`}
                >
                  <Text className={selected ? 'font-bold text-white' : 'text-fb-content'}>
                    {formatRadius(radius)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="mt-6 rounded-3xl bg-fb-surface p-4">
          <View className="mb-4 flex-row items-center">
            <Globe size={18} color={FIND_BACK.info} />
            <Text className="ml-3 text-base font-semibold text-fb-content">Ngôn ngữ</Text>
          </View>
          <View className="flex-row gap-3">
            {(['vi', 'en'] as const).map(language => {
              const selected = preferences.language === language;
              return (
                <TouchableOpacity
                  key={language}
                  disabled={savingKey === 'language'}
                  onPress={() => void update({ language })}
                  className={`flex-1 items-center rounded-2xl border py-3 ${
                    selected
                      ? 'border-fb-primary bg-fb-primary'
                      : 'border-fb-border-subtle bg-fb-surface-elevated'
                  }`}
                >
                  <Text className={selected ? 'font-bold text-white' : 'text-fb-content'}>
                    {language === 'vi' ? 'Tiếng Việt' : 'English'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text className="mt-3 text-xs leading-4 text-fb-muted">
            Tùy chọn này được đồng bộ với tài khoản. Một số nội dung cũ có thể chưa được dịch.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
