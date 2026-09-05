/**
 * DisputeModal Component
 * Modal báo cáo sự cố / tranh chấp trong quá trình bàn giao đồ
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface DisputeModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

const DISPUTE_REASONS = [
  'Món đồ không đúng hoặc bị tráo đổi',
  'Đồ vật bị hư hỏng, mất mát linh kiện',
  'Yêu cầu thêm tiền chuộc ngoài ứng dụng',
  'Người đến gặp không đúng thông tin tài khoản',
  'Lý do khác',
];

export const DisputeModal: React.FC<DisputeModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [selectedReason, setSelectedReason] = useState(DISPUTE_REASONS[0]);
  const [details, setDetails] = useState('');

  const handleSubmit = async () => {
    const fullReason = details.trim() ? `${selectedReason}: ${details.trim()}` : selectedReason;
    await onSubmit(fullReason);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end bg-black/75"
      >
        <View className="max-h-[85%] rounded-t-3xl border-t border-fb-border-subtle bg-fb-surface p-5">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-fb-border-subtle pb-3">
            <View className="flex-row items-center gap-2">
              <AlertTriangle size={20} color={FIND_BACK.danger} />
              <Text className="text-lg font-bold text-fb-content">Báo cáo sự cố bàn giao</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-xl bg-fb-surface-elevated"
            >
              <X size={18} color={FIND_BACK.mutedText} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="py-4">
            <Text className="text-xs font-semibold uppercase tracking-wider text-fb-label mb-2">
              Vấn đề bạn đang gặp phải
            </Text>

            <View className="gap-2 mb-4">
              {DISPUTE_REASONS.map((reason, index) => {
                const isSelected = selectedReason === reason;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedReason(reason)}
                    className={`rounded-xl border p-3 ${
                      isSelected
                        ? 'border-fb-error bg-fb-error/10'
                        : 'border-fb-border-subtle bg-fb-surface-elevated'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        isSelected ? 'font-bold text-fb-error' : 'text-fb-content'
                      }`}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text className="text-xs font-semibold uppercase tracking-wider text-fb-label mb-1.5">
              Mô tả chi tiết sự việc
            </Text>
            <TextInput
              value={details}
              onChangeText={setDetails}
              placeholder="Nhập thông tin chi tiết sự việc để quản trị viên đối soát..."
              placeholderTextColor={FIND_BACK.labelText}
              multiline
              numberOfLines={3}
              className="mb-4 rounded-xl border border-fb-border-subtle bg-fb-surface-elevated p-3 text-sm text-fb-content"
            />

            {/* Warning Info */}
            <View className="mb-6 flex-row gap-2.5 rounded-xl border border-fb-error/30 bg-fb-error/10 p-3">
              <ShieldAlert size={18} color={FIND_BACK.danger} />
              <Text className="flex-1 text-xs leading-relaxed text-fb-error">
                Khi gửi khiếu nại, quy trình giải ngân tiền thưởng sẽ bị khóa ngay lập tức và nhân
                viên hỗ trợ sẽ liên hệ với cả hai bên trong vòng 24 giờ.
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 items-center justify-center rounded-2xl border border-fb-border-subtle bg-fb-surface-elevated py-3.5"
              >
                <Text className="text-sm font-semibold text-fb-muted">Hủy bỏ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                className="flex-1 items-center justify-center rounded-2xl bg-fb-error py-3.5"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-sm font-bold text-white">Gửi khiếu nại</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
