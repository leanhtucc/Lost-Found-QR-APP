/**
 * RewardStatusScreen
 * Màn hình theo dõi giải ngân tiền thưởng phân vai Finder vs Owner
 * Hỗ trợ trạng thái ACTION_REQUIRED cho tài khoản guest/chưa liên kết ngân hàng
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Building,
  Star,
  Home,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';
import { RootStackParamList } from '@/navigation';
import { useReturnStore } from '@/services/returns/store';
import { useRewardStatus } from '@/hooks/useRewardStatus';
import { ItemSummaryCard } from '../components';

type RewardStatusNavProp = StackNavigationProp<RootStackParamList>;

export default function RewardStatusScreen() {
  const navigation = useNavigation<RewardStatusNavProp>();

  const session = useReturnStore(state => state.session);
  const currentRole = useReturnStore(state => state.currentRole);
  const isOwner = currentRole === 'OWNER';

  const { reward, loading, refresh } = useRewardStatus(session?.id);

  const formatCurrency = (amount?: number) => {
    if (!amount) return '0 đ';
    return `${amount.toLocaleString('vi-VN')} đ`;
  };

  const isPaid = reward?.status === 'PAID';
  const isFailed = reward?.status === 'FAILED';
  const needsAction = reward?.status === 'ACTION_REQUIRED';

  const heroTitle = isPaid
    ? isOwner
      ? 'Đã nhận lại đồ thành công'
      : 'Bạn đã nhận được tiền thưởng'
    : isFailed
      ? 'Chuyển tiền chưa thành công'
      : needsAction
        ? 'Cần bổ sung thông tin'
        : 'Đang xử lý giải ngân';

  const heroDescription = isPaid
    ? isOwner
      ? `Tiền thưởng đã được chuyển cho ${session?.finder.displayName || 'người nhặt'}.`
      : `Hệ thống đã chuyển ${formatCurrency(reward?.netAmount)} vào tài khoản nhận tiền của bạn.`
    : isFailed
      ? reward?.failureReason || 'Giao dịch chưa hoàn tất. Vui lòng thử lại hoặc liên hệ hỗ trợ.'
      : needsAction
        ? 'Người nhận cần cập nhật phương thức nhận tiền trước khi hệ thống tiếp tục.'
        : 'Tiền thưởng đang được cổng thanh toán xác minh và xử lý.';

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'TabNavigator' }],
    });
  };

  const handleGoRateFinder = () => {
    if (session) {
      navigation.navigate('RateFinder', { returnSessionId: session.id });
    }
  };

  const handleLinkAccount = () => {
    navigation.navigate('EditProfile');
  };

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

        <Text className="text-base font-bold text-fb-content">
          {isOwner ? 'Biên nhận hoàn trả' : 'Trạng thái nhận thưởng'}
        </Text>

        <TouchableOpacity
          onPress={refresh}
          disabled={loading}
          className="h-10 w-10 items-center justify-center rounded-xl border border-fb-border-subtle bg-fb-surface-elevated"
        >
          {loading ? (
            <ActivityIndicator size="small" color={FIND_BACK.primary} />
          ) : (
            <RefreshCw size={16} color={FIND_BACK.bodyText} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Status Card Hero */}
        <View className="mb-4 items-center rounded-3xl border border-fb-border-subtle bg-fb-surface p-6">
          <View
            className={`h-16 w-16 items-center justify-center rounded-full mb-3 ${
              isPaid
                ? 'bg-fb-secondary/20 border border-fb-secondary'
                : needsAction
                  ? 'bg-fb-tertiary/20 border border-fb-tertiary'
                  : 'bg-fb-primary/20 border border-fb-primary'
            }`}
          >
            {isPaid ? (
              <CheckCircle2 size={32} color={FIND_BACK.secondary} />
            ) : needsAction ? (
              <AlertTriangle size={32} color={FIND_BACK.tertiary} />
            ) : (
              <Clock size={32} color={FIND_BACK.primary} />
            )}
          </View>

          <Text className="text-xl font-extrabold text-fb-content text-center mb-1">
            {heroTitle}
          </Text>

          <Text className="text-xs text-fb-muted text-center max-w-[280px]">{heroDescription}</Text>

          {/* Amount Badge */}
          <View className="mt-4 rounded-2xl bg-fb-surface-elevated px-5 py-2.5 border border-fb-border-subtle">
            <Text className="text-2xl font-black text-fb-secondary">
              {formatCurrency(reward?.netAmount || session?.rewardAmount)}
            </Text>
          </View>
        </View>

        {/* Orange Banner: Action Required */}
        {needsAction && (
          <View className="mb-4 rounded-2xl border border-fb-tertiary/40 bg-fb-tertiary/10 p-4">
            <View className="flex-row items-center gap-2 mb-1.5">
              <AlertTriangle size={18} color={FIND_BACK.tertiary} />
              <Text className="text-sm font-bold text-fb-tertiary">
                Cần liên kết tài khoản ngân hàng
              </Text>
            </View>
            <Text className="text-xs text-fb-muted leading-relaxed mb-3">
              Bạn đang sử dụng tài khoản chưa xác minh. Vui lòng liên kết số điện thoại và tài khoản
              ngân hàng để nhận tiền thưởng.
            </Text>
            <TouchableOpacity
              onPress={handleLinkAccount}
              className="self-start rounded-xl bg-fb-tertiary px-4 py-2.5"
            >
              <Text className="text-xs font-bold text-black">Liên kết tài khoản ngay</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Item Summary */}
        <View className="mb-4">
          <ItemSummaryCard
            name={session?.itemName || 'Món đồ'}
            category={session?.itemCategory}
            imageUrl={session?.itemImageUrl}
          />
        </View>

        {/* Breakdown Card */}
        <View className="mb-4 rounded-2xl border border-fb-border-subtle bg-fb-surface p-4">
          <Text className="text-xs font-bold uppercase tracking-wider text-fb-label mb-3">
            Chi tiết giao dịch
          </Text>

          <View className="flex-row items-center justify-between py-2 border-b border-fb-border-subtle">
            <Text className="text-xs text-fb-muted">Tiền thưởng gốc</Text>
            <Text className="text-xs font-semibold text-fb-content">
              {formatCurrency(reward?.baseReward || session?.rewardAmount)}
            </Text>
          </View>

          <View className="flex-row items-center justify-between py-2 border-b border-fb-border-subtle">
            <Text className="text-xs text-fb-muted">Phí nền tảng</Text>
            <Text className="text-xs font-semibold text-fb-secondary">
              {reward?.platformFee ? formatCurrency(reward.platformFee) : 'Miễn phí'}
            </Text>
          </View>

          <View className="flex-row items-center justify-between py-2 border-b border-fb-border-subtle">
            <Text className="text-xs font-bold text-fb-content">
              {isOwner ? 'Tổng thanh toán' : 'Thực nhận'}
            </Text>
            <Text className="text-sm font-bold text-fb-secondary">
              {formatCurrency(reward?.netAmount || session?.rewardAmount)}
            </Text>
          </View>

          <View className="flex-row items-center justify-between py-2 border-b border-fb-border-subtle">
            <Text className="text-xs text-fb-muted">Tài khoản nhận tiền</Text>
            <View className="flex-row items-center gap-1">
              <Building size={12} color={FIND_BACK.mutedText} />
              <Text className="text-xs font-semibold text-fb-content">
                {reward?.payoutMethodMasked || 'Chưa cập nhật'}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between py-2">
            <Text className="text-xs text-fb-muted">Mã giao dịch</Text>
            <Text className="text-xs font-mono font-semibold text-fb-primary-light">
              {reward?.transactionId || 'TXN-88492015'}
            </Text>
          </View>
        </View>

        {/* Security badge */}
        <View className="mb-6 flex-row gap-2.5 rounded-xl border border-fb-border-subtle bg-fb-surface-elevated p-3">
          <ShieldCheck size={18} color={FIND_BACK.primary} />
          <Text className="flex-1 text-[11px] leading-relaxed text-fb-muted">
            Giao dịch được đối soát tự động qua cổng thanh toán bảo mật. Mọi thay đổi trạng thái đều
            được xác thực qua Webhook bảo mật hai đầu.
          </Text>
        </View>

        {/* Role-Specific CTA Buttons */}
        {isOwner ? (
          <TouchableOpacity
            onPress={handleGoRateFinder}
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-fb-primary py-4 mb-3"
          >
            <Star size={18} color="#fff" fill="#fff" />
            <Text className="text-base font-bold text-white">Đánh giá người nhặt</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleGoHome}
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-fb-primary py-4 mb-3"
          >
            <Home size={18} color="#fff" />
            <Text className="text-base font-bold text-white">Về trang chủ</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleGoHome} className="items-center py-2 mb-8">
          <Text className="text-xs font-semibold text-fb-muted">
            {isOwner ? 'Để sau, về trang chủ' : 'Xem lịch sử tài khoản'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
