/**
 * Public item detail for QR scans and links opened by finders.
 * Private item lookup is attempted only for signed in users to redirect owners.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, MessageSquare, Search, ShieldAlert, ShieldCheck, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Chip, ScreenHeader } from '@components/kit';
import { RootStackParamList } from '@/navigation';
import { itemsApi } from '@/services/items';
import type { ItemCategory } from '@/types/item';
import { getCategoryIcon, getCategoryLabel } from '@/constants/categories';
import { FIND_BACK } from '@constants/theme';
import { createChannel } from '@/services/chat/api';
import { useAuthContext } from '@/contexts/AuthContext';
import { guestSessionStorage, type GuestSession } from '@/storage/guestSession';
import { Button } from '@/components/atoms/Button';
import { GuestIntakeForm } from './GuestIntakeForm';
import { getOwnerItemTarget, getPublicItemStatusMessage } from './guestIntake';

const NEXT_STEPS = [
  'Chủ đồ nhận thông báo ngay',
  'Hai bên trò chuyện và hẹn điểm gặp',
  'Trả đồ có xác nhận bằng mã an toàn',
];

type PublicItemDetailRouteProp = RouteProp<RootStackParamList, 'PublicItemDetails'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

interface PublicItem {
  id?: string;
  qrCodeId?: string;
  publicItemId?: string;
  name: string;
  category: ItemCategory;
  status: string;
  description?: string | null;
  lostMessage?: string | null;
  lostAddress?: string | null;
  imagePublicUrl?: string | null;
  owner?: { displayName?: string; display_name?: string; avatar?: string | null };
}

export default function PublicItemDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PublicItemDetailRouteProp>();
  const { itemId } = route.params;
  const { user, isAuthenticated } = useAuthContext();

  const [item, setItem] = useState<PublicItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [showGuestIntake, setShowGuestIntake] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);

  const loadPublicItem = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (isAuthenticated) {
        try {
          const ownedItem = await itemsApi.getItemById(itemId);
          const target = getOwnerItemTarget(ownedItem);
          if (target) {
            navigation.replace(target.name, target.params);
            return;
          }
        } catch {
          // Non-owners cannot read the private item endpoint; continue with public data.
        }
      }
      const data = (await itemsApi.getPublicItem(itemId)) as PublicItem;
      setItem(data);
      setGuestSession(await guestSessionStorage.get());
    } catch (err: unknown) {
      console.error('Error loading public item:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin món đồ thất lạc');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, itemId, navigation]);

  useEffect(() => {
    void loadPublicItem();
  }, [loadPublicItem]);

  const handleAuthenticatedClaim = async () => {
    if (!item) return;
    const finderId = user?.id || user?.memberId || user?.uid;
    if (!finderId) {
      Alert.alert('Cần đăng nhập', 'Vui lòng đăng nhập để kết nối với chủ sở hữu.');
      return;
    }
    try {
      const result = await createChannel(itemId, finderId);
      const chatResult = result as typeof result & { returnSessionId?: string };
      navigation.navigate('Chat', {
        channelId: result.channel.channelId,
        returnSessionId: chatResult.returnSessionId,
        itemName: item.name,
        userName: item.owner?.displayName || item.owner?.display_name || 'Chủ sở hữu',
      });
    } catch (reason) {
      Alert.alert(
        'Không thể kết nối',
        reason instanceof Error ? reason.message : 'Vui lòng thử lại.'
      );
    }
  };

  const handleGuestSubmit = async (phoneNumber: string) => {
    if (!item) return;
    setIsClaiming(true);
    setGuestError(null);
    try {
      const result = await itemsApi.initGuestScanSession({ itemId, phoneNumber });
      await guestSessionStorage.save({
        guestId: result.guestId,
        returnSessionId: result.returnSessionId,
        channelId: result.channelId,
        guestAccessToken: result.guestAccessToken,
        expiresAt: result.guestAccessExpiresAt,
        chatToken: result.chatToken,
      });
      navigation.replace('Chat', {
        channelId: result.channelId,
        returnSessionId: result.returnSessionId,
        itemName: item.name,
        userName: item.owner?.displayName || item.owner?.display_name || 'Chủ sở hữu',
      });
    } catch (reason) {
      setGuestError(
        reason instanceof Error ? reason.message : 'Không thể tạo phiên khách. Vui lòng thử lại.'
      );
    } finally {
      setIsClaiming(false);
    }
  };

  const handleFindItem = () => {
    if (!item || item.status?.toUpperCase() !== 'LOST') return;
    if (isAuthenticated) {
      void handleAuthenticatedClaim();
    } else {
      setGuestError(null);
      setShowGuestIntake(value => !value);
    }
  };

  const handleExitGuest = async () => {
    await guestSessionStorage.clear();
    setGuestSession(null);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const CategoryIcon = item ? getCategoryIcon(item.category) : null;
  const isLost = item?.status?.toUpperCase() === 'LOST';

  const statusChip = isLost ? (
    <Chip
      label="Đang tìm chủ"
      tone="signal"
      icon={<Search size={12} color={FIND_BACK.tertiary} />}
    />
  ) : (
    <Chip label={item?.status ?? ''} tone="neutral" />
  );

  return (
    <SafeAreaView className="flex-1 bg-fb-canvas" edges={['top']}>
      <ScreenHeader
        title="Đồ vật thất lạc"
        subtitle={guestSession ? 'Bạn đang dùng phiên khách' : undefined}
        onBack={() => navigation.goBack()}
        right={
          guestSession ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => void handleExitGuest()}
              hitSlop={8}
              className="min-h-[44px] justify-center"
            >
              <Text className="text-sm font-semibold text-fb-primary-light">Thoát</Text>
            </Pressable>
          ) : undefined
        }
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={FIND_BACK.primaryLight} />
          <Text className="mt-3 text-sm text-fb-muted">Đang tải thông tin...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-8">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-fb-danger/15">
            <ShieldAlert size={32} color={FIND_BACK.danger} />
          </View>
          <Text className="text-center text-base text-fb-content">{error}</Text>
          <View className="mt-6 w-full max-w-[240px]">
            <Button accessibilityLabel="Thử tải lại món đồ" onPress={() => void loadPublicItem()}>
              Thử lại
            </Button>
          </View>
        </View>
      ) : item ? (
        <>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: isLost ? 140 : 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero */}
            <View className="h-64 w-full overflow-hidden rounded-[28px] border border-fb-border-glass bg-fb-surface">
              {item.imagePublicUrl && !imageFailed ? (
                <Image
                  source={{ uri: item.imagePublicUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                  onError={() => setImageFailed(true)}
                  accessibilityLabel={`Ảnh ${item.name}`}
                />
              ) : (
                <View className="h-full w-full items-center justify-center bg-fb-surface-muted">
                  {CategoryIcon ? <CategoryIcon size={64} color={FIND_BACK.primaryLight} /> : null}
                </View>
              )}
              <LinearGradient
                colors={['rgba(5, 11, 20, 0)', 'rgba(5, 11, 20, 0.85)']}
                pointerEvents="none"
                style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120 }}
              />
              <View className="absolute bottom-4 left-4 right-4">
                <View className="mb-2">{statusChip}</View>
                <Text className="text-2xl font-bold text-fb-content" numberOfLines={2}>
                  {item.name}
                </Text>
                <Text className="text-sm text-fb-muted">{getCategoryLabel(item.category)}</Text>
              </View>
            </View>

            {isLost && item.lostMessage ? (
              <Card tone="warn" className="mt-4">
                <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-fb-tertiary">
                  Lời nhắn từ chủ nhân
                </Text>
                <Text className="text-base leading-6 text-fb-content">{item.lostMessage}</Text>
              </Card>
            ) : null}

            {!isLost ? (
              <Card className="mt-4">
                <Text className="text-base leading-6 text-fb-content">
                  {getPublicItemStatusMessage(item.status)}
                </Text>
              </Card>
            ) : null}

            {item.description || (isLost && item.lostAddress) ? (
              <Card className="mt-4 gap-4">
                {item.description ? (
                  <View>
                    <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-fb-label">
                      Đặc điểm nhận dạng
                    </Text>
                    <Text className="text-base leading-6 text-fb-content">{item.description}</Text>
                  </View>
                ) : null}
                {isLost && item.lostAddress ? (
                  <View className="flex-row items-start gap-3">
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-fb-danger/15">
                      <MapPin size={18} color={FIND_BACK.danger} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-fb-muted">Khu vực nghi thất lạc</Text>
                      <Text className="text-base font-semibold text-fb-content">
                        {item.lostAddress}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </Card>
            ) : null}

            <Card className="mt-4 flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-fb-primary/15">
                <User size={20} color={FIND_BACK.primaryLight} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-fb-content">
                  {item.owner?.displayName || item.owner?.display_name || 'Chủ sở hữu ẩn danh'}
                </Text>
                <View className="mt-0.5 flex-row items-center gap-1.5">
                  <ShieldCheck size={13} color={FIND_BACK.secondary} />
                  <Text className="text-xs text-fb-muted">Thông tin liên hệ được bảo vệ</Text>
                </View>
              </View>
            </Card>

            {isLost ? (
              <Card tone="tint" className="mt-4">
                <Text className="mb-2 text-sm font-semibold text-fb-content">
                  Điều gì xảy ra tiếp theo?
                </Text>
                {NEXT_STEPS.map((step, i) => (
                  <View key={step} className="mt-1.5 flex-row items-center gap-3">
                    <View className="h-6 w-6 items-center justify-center rounded-full bg-fb-primary">
                      <Text className="text-xs font-bold text-white">{i + 1}</Text>
                    </View>
                    <Text className="flex-1 text-sm text-fb-muted">{step}</Text>
                  </View>
                ))}
              </Card>
            ) : null}

            {isLost && !isAuthenticated && showGuestIntake ? (
              <GuestIntakeForm
                loading={isClaiming}
                error={guestError}
                onSubmit={phoneNumber => void handleGuestSubmit(phoneNumber)}
                onCancel={() => setShowGuestIntake(false)}
              />
            ) : null}
          </ScrollView>

          {isLost ? (
            <View className="absolute bottom-0 left-0 right-0 border-t border-fb-border-glass bg-fb-canvas px-4 pb-6 pt-3">
              <Button
                accessibilityLabel="Tôi đã nhặt được món đồ này"
                onPress={handleFindItem}
                leftIcon={<MessageSquare size={18} color="#FFFFFF" />}
                loading={isAuthenticated && isClaiming}
                disabled={isAuthenticated && isClaiming}
              >
                Tôi đã nhặt được món đồ này
              </Button>
            </View>
          ) : null}
        </>
      ) : (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-center text-base text-fb-muted">
            Không tìm thấy thông tin món đồ.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
