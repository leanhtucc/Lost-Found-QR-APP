import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Check, Phone, ShieldCheck } from 'lucide-react-native';
import { Button } from '@/components/atoms/Button';
import { FormField } from '@components/kit';
import { FIND_BACK } from '@constants/theme';
import { isValidGuestPhoneNumber } from './guestIntake';

interface GuestIntakeFormProps {
  loading: boolean;
  error: string | null;
  onSubmit: (phoneNumber: string) => void;
  onCancel: () => void;
}
export function GuestIntakeForm({ loading, error, onSubmit, onCancel }: GuestIntakeFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [consented, setConsented] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const submit = () => {
    const normalized = phoneNumber.replace(/[\s().-]/g, '');
    if (!isValidGuestPhoneNumber(phoneNumber)) {
      setValidationError('Vui lòng nhập số điện thoại hợp lệ (8 đến 15 chữ số).');
      return;
    }
    if (!consented) {
      setValidationError('Vui lòng đồng ý chia sẻ số điện thoại để tiếp tục.');
      return;
    }
    setValidationError(null);
    onSubmit(normalized);
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(350)}
      className="mt-4 rounded-3xl border border-fb-border-glass bg-fb-surface p-5"
    >
      <Text className="mb-1 text-lg font-bold text-fb-content">Liên hệ chủ đồ</Text>
      <View className="mb-4 flex-row items-start gap-2">
        <ShieldCheck size={16} color={FIND_BACK.secondary} style={{ marginTop: 2 }} />
        <Text className="flex-1 text-sm leading-5 text-fb-muted">
          Số điện thoại chỉ để chủ đồ xác nhận bạn là người thật và{' '}
          <Text className="font-semibold text-fb-content">không hiển thị công khai</Text>.
        </Text>
      </View>

      <FormField
        label="Số điện thoại"
        icon={<Phone size={20} color={FIND_BACK.mutedText} />}
        value={phoneNumber}
        onChangeText={value => {
          setPhoneNumber(value);
          setValidationError(null);
        }}
        placeholder="Ví dụ: 0901234567"
        keyboardType="phone-pad"
        autoComplete="tel"
        maxLength={20}
        editable={!loading}
      />

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: consented }}
        accessibilityLabel="Đồng ý chia sẻ số điện thoại"
        onPress={() => setConsented(value => !value)}
        className="mt-4 min-h-[44px] flex-row items-start gap-3"
      >
        <View
          className={
            consented
              ? 'mt-0.5 h-6 w-6 items-center justify-center rounded-lg border border-fb-primary bg-fb-primary'
              : 'mt-0.5 h-6 w-6 rounded-lg border border-white/30'
          }
        >
          {consented ? <Check size={15} color="#FFFFFF" strokeWidth={3} /> : null}
        </View>
        <Text className="flex-1 text-sm leading-5 text-fb-content">
          Tôi đồng ý chia sẻ số điện thoại với chủ món đồ để phối hợp trả lại.
        </Text>
      </Pressable>

      {validationError || error ? (
        <Text accessibilityRole="alert" className="mt-3 text-sm text-fb-danger">
          {validationError || error}
        </Text>
      ) : null}

      <View className="mt-5 gap-3">
        <Button
          accessibilityLabel={error ? 'Thử lại tạo phiên khách' : 'Tạo phiên khách'}
          onPress={submit}
          disabled={loading}
          loading={loading}
        >
          {error ? 'Thử lại' : 'Bắt đầu trò chuyện'}
        </Button>
        <Button variant="outlined" onPress={onCancel} disabled={loading}>
          Hủy
        </Button>
      </View>
    </Animated.View>
  );
}
