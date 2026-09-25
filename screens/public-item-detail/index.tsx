/**
 * Public Item Detail Screen
 * Màn hình xem chi tiết đồ thất lạc của người khác (từ Radar Home)
 * Bảo vệ dữ liệu nhạy cảm: Tuyệt đối không hiển thị vị trí cất giữ SAFE
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, MessageSquare, ShieldAlert, User } from 'lucide-react-native';
import { RootStackParamList } from '@/navigation';
import { itemsApi } from '@/services/items';
import { getCategoryIcon, getCategoryLabel } from '@/constants/categories';
import { FIND_BACK } from '@constants/theme';
import { createChannel } from '@/services/chat/api';
import { useAuthContext } from '@/contexts/AuthContext';

type PublicItemDetailRouteProp = RouteProp<RootStackParamList, 'PublicItemDetails'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function PublicItemDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PublicItemDetailRouteProp>();
  const { itemId } = route.params;
  const { user } = useAuthContext();

  const [item, setItem] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  const loadPublicItem = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await itemsApi.getPublicItem(itemId);
      setItem(data);
    } catch (err: any) {
      console.error('Error loading public item:', err);
      setError(err?.message || 'Không thể tải thông tin món đồ thất lạc');
    } finally {
      setIsLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    void loadPublicItem();
  }, [loadPublicItem]);

  const handleContactOwner = async () => {
    if (!item) return;
    const finderId = user?.id || user?.memberId || user?.uid;
    if (!finderId) {
      Alert.alert('Cần đăng nhập', 'Vui lòng đăng nhập để kết nối với chủ sở hữu.');
      return;
    }
    try {
      const result = await createChannel(itemId, finderId);
      navigation.navigate('Chat', {
        channelId: result.channel.channelId,
        itemName: item.name,
        userName: item.owner?.displayName || 'Chủ sở hữu',
      });
    } catch (reason) {
      Alert.alert(
        'Không thể kết nối',
        reason instanceof Error ? reason.message : 'Vui lòng thử lại.'
      );
    }
  };

  const CategoryIcon = item ? getCategoryIcon(item.category) : null;

  return (
    <SafeAreaView className="flex-1 bg-fb-canvas" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-fb-border-subtle">
        <View className="flex-row items-center gap-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft color={FIND_BACK.bodyText} size={24} />
          </Pressable>
          <Text className="text-lg font-bold text-white">Đồ vật thất lạc</Text>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={FIND_BACK.primaryLight} />
          <Text className="mt-3 text-xs text-fb-muted">Đang tải thông tin...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-6">
          <ShieldAlert size={48} color={FIND_BACK.danger} />
          <Text className="mt-4 text-center text-sm text-white">{error}</Text>
          <TouchableOpacity
            onPress={loadPublicItem}
            className="mt-4 rounded-xl bg-fb-primary px-5 py-2.5"
          >
            <Text className="font-semibold text-white">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : item ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Large Image */}
          {item.imagePublicUrl && !imageFailed ? (
            <View className="mb-5 h-56 w-full overflow-hidden rounded-3xl bg-fb-surface border border-fb-border-subtle">
              <Image
                source={{ uri: item.imagePublicUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                onError={() => setImageFailed(true)}
              />
            </View>
          ) : null}

          {/* Card Thông tin cơ bản */}
          <View className="mb-4 rounded-3xl border border-fb-border-subtle bg-fb-surface p-5">
            <View className="flex-row items-center gap-4">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-fb-primary/15">
                {CategoryIcon ? <CategoryIcon size={28} color={FIND_BACK.primaryLight} /> : null}
              </View>

              <View className="flex-1">
                <Text className="mb-1 text-xl font-bold text-fb-content">{item.name}</Text>
                <Text className="text-sm text-fb-muted">{getCategoryLabel(item.category)}</Text>
              </View>

              <View className="rounded-full bg-rose-500/15 px-3 py-1.5 border border-rose-500/30">
                <Text className="text-xs font-bold text-rose-400">Đang mất</Text>
              </View>
            </View>

            {item.description ? (
              <View className="mt-4 border-t border-fb-border-subtle pt-4">
                <Text className="text-xs font-semibold text-fb-label">Mô tả nhận dạng:</Text>
                <Text className="mt-1 text-sm leading-6 text-fb-content">{item.description}</Text>
              </View>
            ) : null}
          </View>

          {/* Card Tin nhắn & Vị trí báo mất */}
          <View className="mb-4 rounded-3xl border border-fb-border-subtle bg-fb-surface p-5">
            <Text className="text-sm font-bold text-fb-content mb-3">
              Thông tin báo mất từ chủ nhân
            </Text>

            {item.lostMessage ? (
              <View className="mb-3 rounded-2xl bg-amber-500/10 p-3.5 border border-amber-500/20">
                <Text className="text-xs font-semibold text-amber-400 mb-1">Lời nhắn:</Text>
                <Text className="text-sm text-amber-100">{item.lostMessage}</Text>
              </View>
            ) : null}

            {item.lostAddress ? (
              <View className="flex-row items-start gap-2.5 pt-1">
                <MapPin size={16} color={FIND_BACK.danger} style={{ marginTop: 2 }} />
                <View className="flex-1">
                  <Text className="text-xs font-medium text-fb-muted">Khu vực nghi thất lạc:</Text>
                  <Text className="text-sm font-semibold text-fb-content">{item.lostAddress}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Card Chủ nhân ẩn danh */}
          <View className="mb-6 rounded-3xl border border-fb-border-subtle bg-fb-surface p-5">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-fb-neutral">
                <User size={20} color="#94a3b8" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-fb-content">
                  {item.owner?.displayName || 'Chủ sở hữu ẩn danh'}
                </Text>
                <Text className="text-xs text-fb-muted">Bảo vệ qua hệ thống FindBack</Text>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={{
              backgroundColor: FIND_BACK.primaryLight,
              paddingVertical: 16,
              borderRadius: 18,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            onPress={() => void handleContactOwner()}
            activeOpacity={0.85}
          >
            <MessageSquare size={18} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>
              Tôi đã nhặt được món đồ này
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
