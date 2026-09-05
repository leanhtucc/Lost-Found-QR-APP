/**
 * HandoverConfirmScreen
 * Màn hình xác nhận bàn giao đồ vật 2 phía: Mã 6 chữ số / QR Code + Checklist kiểm tra
 * Kết nối backend /v1/returns/:id/handover/confirm, xử lý mã lỗi nghiệp vụ chi tiết
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import QRCode from 'react-native-qrcode-svg';
import {
  ArrowLeft,
  ShieldCheck,
  CheckSquare,
  Square,
  Handshake,
  AlertTriangle,
  KeyRound,
  RefreshCw,
} from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';
import { RootStackParamList } from '@/navigation';
import { useReturnStore } from '@/services/returns/store';
import { ItemSummaryCard, DisputeModal } from '../components';

type HandoverNavProp = StackNavigationProp<RootStackParamList>;

export default function HandoverConfirmScreen() {
  const navigation = useNavigation<HandoverNavProp>();

  const session = useReturnStore(state => state.session);
  const currentRole = useReturnStore(state => state.currentRole);
  const isSubmitting = useReturnStore(state => state.isSubmitting);
  const error = useReturnStore(state => state.error);
  const errorCode = useReturnStore(state => state.errorCode);
  const initHandover = useReturnStore(state => state.initHandover);
  const confirmHandover = useReturnStore(state => state.confirmHandover);
  const disputeHandover = useReturnStore(state => state.disputeHandover);
  const refreshSession = useReturnStore(state => state.refreshSession);
  const clearError = useReturnStore(state => state.clearError);

  // Finder state
  const [handoverCode, setHandoverCode] = useState(session?.handover?.code || '');
  const [finderConfirmedCheck, setFinderConfirmedCheck] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [isRefreshingCode, setIsRefreshingCode] = useState(false);

  // Owner state: 3-point checklist
  const [checkItemCorrect, setCheckItemCorrect] = useState(false);
  const [checkCondition, setCheckCondition] = useState(false);
  const [checkInPerson, setCheckInPerson] = useState(false);
  const [inputCode, setInputCode] = useState('');

  // Dispute modal
  const [isDisputeVisible, setIsDisputeVisible] = useState(false);

  // Init handover details on mount
  useEffect(() => {
    if (!session?.id) return;
    if (session.handover?.code) {
      setHandoverCode(session.handover.code);
      return;
    }

    const init = async () => {
      const details = await initHandover();
      if (details?.code) {
        setHandoverCode(details.code);
      }
    };
    void init();
  }, [initHandover, session?.handover?.code, session?.id]);

  const isOwner = currentRole === 'OWNER';
  const partner = isOwner ? session?.finder : session?.owner;

  const canOwnerConfirm =
    checkItemCorrect && checkCondition && checkInPerson && inputCode.trim().length >= 6;
  const canFinderConfirm = finderConfirmedCheck;

  // Xử lý thông điệp lỗi thân thiện theo mã lỗi backend
  const getErrorMessage = (): string | null => {
    if (!errorCode && !error) return null;

    switch (errorCode) {
      case 'INVALID_HANDOVER_CODE':
        return 'Mã xác nhận không chính xác. Vui lòng kiểm tra lại trên máy người nhặt.';
      case 'HANDOVER_CODE_LOCKED':
        return 'Mã đã bị khóa do nhập sai quá 5 lần. Vui lòng yêu cầu người nhặt tạo mã mới.';
      case 'HANDOVER_CODE_EXPIRED':
        return 'Mã bàn giao đã hết hạn (sau 5 phút). Vui lòng yêu cầu người nhặt tạo mã mới.';
      case 'REVISION_CONFLICT':
        return 'Dữ liệu phiên đã thay đổi. Hệ thống đang đồng bộ lại...';
      case 'INVALID_RETURN_TRANSITION':
        return 'Không thể thực hiện xác nhận ở trạng thái hiện tại.';
      default:
        return error || 'Xác nhận không thành công. Vui lòng thử lại.';
    }
  };

  const handleGenerateNewCode = async () => {
    setIsRefreshingCode(true);
    clearError();
    try {
      const details = await initHandover();
      if (details?.code) {
        setHandoverCode(details.code);
      }
    } finally {
      setIsRefreshingCode(false);
    }
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;
    clearError();

    const codeToVerify = isOwner ? inputCode.trim() : handoverCode;
    const success = await confirmHandover(codeToVerify);

    if (success) {
      const updatedSession = useReturnStore.getState().session;
      if (
        updatedSession &&
        ['HANDOVER_CONFIRMED', 'REWARD_RELEASING', 'REWARD_PAID', 'RATING_PENDING'].includes(
          updatedSession.status
        )
      ) {
        navigation.replace('RewardStatus', { returnSessionId: updatedSession.id });
      } else {
        setConfirmationSent(true);
      }
    } else {
      if (useReturnStore.getState().errorCode === 'REVISION_CONFLICT') {
        void refreshSession();
      }
    }
  };

  const handleDisputeSubmit = async (reason: string) => {
    setIsDisputeVisible(false);
    const success = await disputeHandover(reason);
    if (success) {
      Alert.alert(
        'Đã gửi khiếu nại',
        'Phiên bàn giao đã được tạm khóa. Bộ phận hỗ trợ FindBack sẽ kiểm tra và liên hệ sớm nhất.',
        [{ text: 'Đóng', onPress: () => navigation.goBack() }]
      );
    }
  };

  const errorMessage = getErrorMessage();

  return (
    <SafeAreaView className="flex-1 bg-fb-canvas" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-fb-border-subtle bg-fb-surface px-4 py-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="h-10 w-10 items-center justify-center rounded-xl border border-fb-border-subtle bg-fb-surface-elevated"
        >
          <ArrowLeft size={18} color={FIND_BACK.bodyText} />
        </TouchableOpacity>

        <Text className="text-base font-bold text-fb-content">Xác nhận trao nhận đồ</Text>

        <TouchableOpacity
          onPress={() => setIsDisputeVisible(true)}
          className="h-10 w-10 items-center justify-center rounded-xl border border-fb-error/30 bg-fb-error/10"
        >
          <AlertTriangle size={18} color={FIND_BACK.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Item Summary */}
        <View className="mb-4">
          <ItemSummaryCard
            name={session?.itemName || 'Đồ vật'}
            category={session?.itemCategory}
            imageUrl={session?.itemImageUrl}
            rewardAmount={session?.rewardAmount}
          />
        </View>

        {/* Meetup Point reminder */}
        <View className="mb-4 rounded-2xl border border-fb-border-subtle bg-fb-surface p-3.5">
          <Text className="text-xs font-semibold uppercase text-fb-label mb-1">
            Điểm hẹn bàn giao
          </Text>
          <Text className="text-sm font-bold text-fb-content">
            {session?.meetup?.name || session?.meetup?.address || 'Điểm hẹn đã thống nhất'}
          </Text>
          <Text className="text-xs text-fb-muted mt-0.5">
            Gặp mặt cùng:{' '}
            <Text className="font-semibold text-fb-content">{partner?.displayName}</Text>
          </Text>
        </View>

        {/* ROLE: FINDER (Show code & QR) */}
        {!isOwner && (
          <View className="mb-4 rounded-2xl border border-fb-border-subtle bg-fb-surface p-5 items-center">
            <Text className="text-xs font-bold uppercase tracking-wider text-fb-primary-light mb-1">
              Mã bàn giao bảo mật
            </Text>
            <Text className="text-xs text-fb-muted text-center mb-4">
              Đưa mã 6 số này hoặc cho chủ đồ quét mã QR để xác nhận trao đồ (hiệu lực 5 phút)
            </Text>

            {/* QR Code Container */}
            <View className="p-4 rounded-2xl bg-white mb-4 items-center justify-center shadow-lg">
              {handoverCode ? (
                <QRCode
                  value={
                    session?.handover?.qrPayload || `handover://${session?.id}?code=${handoverCode}`
                  }
                  size={160}
                  color="#000000"
                  backgroundColor="#ffffff"
                />
              ) : (
                <View className="h-40 w-40 items-center justify-center">
                  <ActivityIndicator size="large" color={FIND_BACK.primary} />
                </View>
              )}
            </View>

            {/* 6-Digit Code */}
            <View className="flex-row items-center gap-3 rounded-2xl border border-fb-primary/40 bg-fb-primary/10 px-5 py-3 mb-3">
              <KeyRound size={20} color={FIND_BACK.primary} />
              <Text className="text-2xl font-extrabold tracking-widest text-fb-primary-light">
                {handoverCode || '••••••'}
              </Text>
            </View>

            {/* Refresh / Generate new code button */}
            <TouchableOpacity
              onPress={handleGenerateNewCode}
              disabled={isRefreshingCode}
              className="flex-row items-center gap-1.5 py-1 px-3 mb-4 rounded-lg bg-fb-surface-elevated border border-fb-border-subtle"
            >
              {isRefreshingCode ? (
                <ActivityIndicator size="small" color={FIND_BACK.primary} />
              ) : (
                <RefreshCw size={13} color={FIND_BACK.primaryLight} />
              )}
              <Text className="text-xs font-medium text-fb-primary-light">Lấy mã mới</Text>
            </TouchableOpacity>

            {/* Finder Checklist Checkbox */}
            <TouchableOpacity
              onPress={() => setFinderConfirmedCheck(!finderConfirmedCheck)}
              className="flex-row items-center gap-3 rounded-xl border border-fb-border-subtle bg-fb-surface-elevated p-3 w-full"
            >
              {finderConfirmedCheck ? (
                <CheckSquare size={20} color={FIND_BACK.secondary} />
              ) : (
                <Square size={20} color={FIND_BACK.mutedText} />
              )}
              <Text className="text-xs font-semibold text-fb-content flex-1">
                Tôi đã trao tận tay món đồ nguyên vẹn cho chủ sở hữu
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ROLE: OWNER (3-Point Checklist & Input code) */}
        {isOwner && (
          <View className="mb-4 rounded-2xl border border-fb-border-subtle bg-fb-surface p-4">
            <Text className="text-xs font-bold uppercase tracking-wider text-fb-label mb-3">
              Danh sách kiểm tra (Bắt buộc)
            </Text>

            {/* Checklist Item 1 */}
            <TouchableOpacity
              onPress={() => setCheckItemCorrect(!checkItemCorrect)}
              className="flex-row items-start gap-3 rounded-xl border border-fb-border-subtle bg-fb-surface-elevated p-3 mb-2"
            >
              {checkItemCorrect ? (
                <CheckSquare size={20} color={FIND_BACK.secondary} />
              ) : (
                <Square size={20} color={FIND_BACK.mutedText} />
              )}
              <View className="flex-1">
                <Text className="text-xs font-bold text-fb-content">Đúng món đồ của tôi</Text>
                <Text className="text-[11px] text-fb-muted">
                  Đã đối chiếu các đặc điểm nhận dạng và đồ vật bên trong
                </Text>
              </View>
            </TouchableOpacity>

            {/* Checklist Item 2 */}
            <TouchableOpacity
              onPress={() => setCheckCondition(!checkCondition)}
              className="flex-row items-start gap-3 rounded-xl border border-fb-border-subtle bg-fb-surface-elevated p-3 mb-2"
            >
              {checkCondition ? (
                <CheckSquare size={20} color={FIND_BACK.secondary} />
              ) : (
                <Square size={20} color={FIND_BACK.mutedText} />
              )}
              <View className="flex-1">
                <Text className="text-xs font-bold text-fb-content">Tình trạng còn nguyên vẹn</Text>
                <Text className="text-[11px] text-fb-muted">
                  Đã kiểm tra kỹ không có hư hại bất thường hoặc tráo đổi
                </Text>
              </View>
            </TouchableOpacity>

            {/* Checklist Item 3 */}
            <TouchableOpacity
              onPress={() => setCheckInPerson(!checkInPerson)}
              className="flex-row items-start gap-3 rounded-xl border border-fb-border-subtle bg-fb-surface-elevated p-3 mb-4"
            >
              {checkInPerson ? (
                <CheckSquare size={20} color={FIND_BACK.secondary} />
              ) : (
                <Square size={20} color={FIND_BACK.mutedText} />
              )}
              <View className="flex-1">
                <Text className="text-xs font-bold text-fb-content">
                  Đã nhận trực tiếp từ người nhặt
                </Text>
                <Text className="text-[11px] text-fb-muted">
                  Hai bên đã gặp mặt trực tiếp tại điểm hẹn an toàn
                </Text>
              </View>
            </TouchableOpacity>

            {/* Input 6-Digit Code */}
            <Text className="text-xs font-bold uppercase tracking-wider text-fb-label mb-1.5">
              Nhập mã bàn giao từ người nhặt
            </Text>
            <View
              className={`flex-row items-center rounded-xl border px-3 py-1 mb-2 ${
                errorMessage
                  ? 'border-fb-error bg-fb-error/10'
                  : 'border-fb-border-subtle bg-fb-surface-elevated'
              }`}
            >
              <KeyRound size={18} color={errorMessage ? FIND_BACK.danger : FIND_BACK.primary} />
              <TextInput
                value={inputCode}
                onChangeText={text => {
                  setInputCode(text);
                  if (errorMessage) clearError();
                }}
                placeholder="Nhập mã gồm 6 chữ số"
                placeholderTextColor={FIND_BACK.labelText}
                keyboardType="number-pad"
                maxLength={6}
                className="flex-1 px-3 py-2.5 text-base font-bold text-fb-content tracking-widest"
              />
            </View>
            <Text className="text-[11px] text-fb-muted">
              Hỏi người nhặt mã 6 số hiển thị trên điện thoại của họ để điền vào đây.
            </Text>
          </View>
        )}

        {/* Error Banner if validation or submission failed */}
        {errorMessage && (
          <View className="mb-4 flex-row items-center gap-2.5 rounded-xl border border-fb-error/40 bg-fb-error/15 p-3">
            <AlertTriangle size={18} color={FIND_BACK.danger} />
            <Text className="flex-1 text-xs font-medium text-fb-error">{errorMessage}</Text>
          </View>
        )}

        {/* Security & Payout Assurance */}
        <View className="mb-6 flex-row gap-2.5 rounded-xl border border-fb-secondary/30 bg-fb-secondary/5 p-3">
          <ShieldCheck size={18} color={FIND_BACK.secondary} />
          <View className="flex-1">
            <Text className="text-xs font-bold text-fb-secondary">Bảo chứng giải ngân tự động</Text>
            <Text className="mt-0.5 text-[11px] leading-relaxed text-fb-muted">
              Chỉ khi cả hai bên xác nhận trao nhận đồ, hệ thống mới tiến hành giải ngân tiền
              thưởng. Không có trường hợp mất tiền mà không nhận lại được đồ.
            </Text>
          </View>
        </View>

        {/* Confirm Button / waiting state */}
        {confirmationSent ? (
          <View className="mb-3 items-center rounded-2xl border border-fb-secondary/30 bg-fb-secondary/10 px-4 py-4">
            <ShieldCheck size={22} color={FIND_BACK.secondary} />
            <Text className="mt-2 text-sm font-bold text-fb-secondary">Đã ghi nhận xác nhận</Text>
            <Text className="mt-1 text-center text-xs text-fb-muted">
              Đang chờ đối phương xác nhận để chuyển sang bước nhận thưởng.
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!(isOwner ? canOwnerConfirm : canFinderConfirm) || isSubmitting}
            accessibilityRole="button"
            className={`flex-row items-center justify-center gap-2 rounded-2xl py-4 mb-3 ${
              (isOwner ? canOwnerConfirm : canFinderConfirm) && !isSubmitting
                ? 'bg-fb-secondary'
                : 'bg-fb-surface-elevated opacity-50'
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <Handshake size={20} color="#000" />
                <Text className="text-base font-bold text-black">
                  {isOwner ? 'Xác nhận đã nhận lại đồ' : 'Xác nhận đã trao đồ'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Dispute Button */}
        <TouchableOpacity
          onPress={() => setIsDisputeVisible(true)}
          className="items-center py-2 mb-8"
        >
          <Text className="text-xs font-semibold text-fb-error">
            Có vấn đề? Báo cáo sự cố tại đây
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Dispute Modal */}
      <DisputeModal
        visible={isDisputeVisible}
        onClose={() => setIsDisputeVisible(false)}
        onSubmit={handleDisputeSubmit}
        isLoading={isSubmitting}
      />
    </SafeAreaView>
  );
}
