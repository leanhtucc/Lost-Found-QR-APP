/**
 * RateFinderScreen
 * Màn hình đánh giá người nhặt (chỉ dành cho Owner sau khi nhận lại đồ)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, Star, Home, Heart, BadgeCheck } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';
import { RootStackParamList } from '@/navigation';
import { useReturnStore } from '@/services/returns/store';
import { useReturnSession } from '@/hooks/useReturnSession';

type RateFinderNavProp = StackNavigationProp<RootStackParamList>;
type RateFinderRouteProp = RouteProp<RootStackParamList, 'RateFinder'>;

const QUICK_TAGS = [
  'Thân thiện',
  'Phản hồi nhanh',
  'Đúng giờ',
  'Giữ đồ cẩn thận',
  'Đáng tin cậy',
  'Nhiệt tình',
];

const STAR_LABELS: Record<number, string> = {
  1: 'Kém hài lòng',
  2: 'Cần cải thiện',
  3: 'Bình thường',
  4: 'Rất tốt',
  5: 'Tuyệt vời, cảm ơn bạn rất nhiều!',
};

export default function RateFinderScreen() {
  const navigation = useNavigation<RateFinderNavProp>();
  const route = useRoute<RateFinderRouteProp>();

  const { session, currentRole, isLoading } = useReturnSession({
    sessionId: route.params.returnSessionId,
  });
  const isSubmitting = useReturnStore(state => state.isSubmitting);
  const submitRating = useReturnStore(state => state.submitRating);

  const finder = session?.finder;

  const [score, setScore] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(!!session?.rating);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleSubmit = async () => {
    if (score < 1 || isSubmitting) return;

    const success = await submitRating({
      score,
      tags: selectedTags,
      comment: comment.trim() || undefined,
    });

    if (success) {
      setIsSubmitted(true);
    }
  };

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'TabNavigator' }],
    });
  };

  if (isLoading && !session) {
    return (
      <View className="flex-1 items-center justify-center bg-fb-canvas">
        <ActivityIndicator size="large" color={FIND_BACK.primary} />
        <Text className="mt-3 text-xs text-fb-muted">Đang tải thông tin đánh giá...</Text>
      </View>
    );
  }

  if (currentRole && currentRole !== 'OWNER') {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-fb-canvas p-6">
        <Text className="text-center text-lg font-bold text-fb-content">
          Chỉ chủ sở hữu mới có thể đánh giá
        </Text>
        <Text className="mt-2 text-center text-sm text-fb-muted">
          Cảm ơn bạn đã giúp món đồ trở về với chủ nhân.
        </Text>
        <TouchableOpacity
          onPress={handleGoHome}
          className="mt-6 rounded-2xl bg-fb-primary px-6 py-3"
        >
          <Text className="font-bold text-white">Về trang chủ</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Thank You State after submission
  if (isSubmitted) {
    return (
      <SafeAreaView className="flex-1 bg-fb-canvas justify-center p-6" edges={['top', 'bottom']}>
        <View className="items-center rounded-3xl border border-fb-border-subtle bg-fb-surface p-8 shadow-2xl">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-fb-secondary/20 border border-fb-secondary mb-4">
            <Heart size={40} color={FIND_BACK.secondary} fill={FIND_BACK.secondary} />
          </View>

          <Text className="text-2xl font-black text-fb-content text-center mb-2">Cảm ơn bạn!</Text>
          <Text className="text-sm text-fb-muted text-center leading-relaxed mb-6">
            Đánh giá của bạn giúp cộng đồng FindBack trở nên tin cậy và gắn kết hơn. Điểm uy tín của{' '}
            <Text className="font-bold text-fb-content">{finder?.displayName}</Text> đã được ghi
            nhận.
          </Text>

          <TouchableOpacity
            onPress={handleGoHome}
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-fb-primary py-4 w-full"
          >
            <Home size={18} color="#fff" />
            <Text className="text-base font-bold text-white">Về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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

        <Text className="text-base font-bold text-fb-content">Đánh giá người nhặt</Text>

        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Finder Card Preview */}
        <View className="mb-6 items-center rounded-3xl border border-fb-border-subtle bg-fb-surface p-5">
          <View className="relative mb-3">
            <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-fb-primary/40 bg-fb-primary/10">
              {finder?.photoURL ? (
                <Image
                  source={{ uri: finder.photoURL }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-xl font-black text-fb-primary-light">
                  {finder?.displayName?.charAt(0).toUpperCase() || 'N'}
                </Text>
              )}
            </View>
            <View className="absolute -bottom-1 -right-1 rounded-full bg-fb-surface p-0.5">
              <BadgeCheck size={18} color={FIND_BACK.info} fill={FIND_BACK.info} />
            </View>
          </View>

          <Text className="text-lg font-bold text-fb-content">{finder?.displayName}</Text>
          <Text className="text-xs text-fb-muted mt-0.5">
            Đã hoàn trả: {session?.itemName || 'Đồ vật'}
          </Text>

          {finder?.trustScore && (
            <View className="mt-2 rounded-full border border-fb-secondary/40 bg-fb-secondary/15 px-3 py-1">
              <Text className="text-xs font-bold text-fb-secondary">
                Điểm tin cậy: {finder.trustScore}/100
              </Text>
            </View>
          )}
        </View>

        {/* 5-Star Interactive Rating */}
        <View className="mb-6 items-center rounded-3xl border border-fb-border-subtle bg-fb-surface p-5">
          <Text className="text-xs font-bold uppercase tracking-wider text-fb-label mb-3">
            Trải nghiệm nhận lại đồ
          </Text>

          <View className="flex-row items-center gap-3 mb-2">
            {[1, 2, 3, 4, 5].map(starNum => (
              <TouchableOpacity
                key={starNum}
                onPress={() => setScore(starNum)}
                className="p-1.5"
                accessibilityLabel={`${starNum} sao`}
              >
                <Star
                  size={36}
                  color={starNum <= score ? '#FBBF24' : FIND_BACK.labelText}
                  fill={starNum <= score ? '#FBBF24' : 'transparent'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-sm font-semibold text-fb-primary-light">
            {STAR_LABELS[score] || 'Chạm vào số sao bạn muốn đánh giá'}
          </Text>
        </View>

        {/* Quick Feedback Tags */}
        <View className="mb-6 rounded-3xl border border-fb-border-subtle bg-fb-surface p-5">
          <Text className="text-xs font-bold uppercase tracking-wider text-fb-label mb-3">
            Ấn tượng nổi bật
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {QUICK_TAGS.map((tag, idx) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => toggleTag(tag)}
                  className={`rounded-xl border px-3.5 py-2 ${
                    isSelected
                      ? 'border-fb-primary bg-fb-primary/20'
                      : 'border-fb-border-subtle bg-fb-surface-elevated'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isSelected ? 'text-fb-primary-light' : 'text-fb-content'
                    }`}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Written Review */}
        <View className="mb-6 rounded-3xl border border-fb-border-subtle bg-fb-surface p-5">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs font-bold uppercase tracking-wider text-fb-label">
              Lời nhắn gửi (Tùy chọn)
            </Text>
            <Text className="text-xs text-fb-muted">{comment.length}/200</Text>
          </View>

          <TextInput
            value={comment}
            onChangeText={text => text.length <= 200 && setComment(text)}
            placeholder="Viết vài dòng cảm ơn hoặc chia sẻ trải nghiệm của bạn..."
            placeholderTextColor={FIND_BACK.labelText}
            multiline
            numberOfLines={3}
            className="rounded-2xl border border-fb-border-subtle bg-fb-surface-elevated p-3 text-sm text-fb-content"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={score < 1 || isSubmitting}
          className={`flex-row items-center justify-center gap-2 rounded-2xl py-4 mb-3 ${
            score >= 1 && !isSubmitting ? 'bg-fb-primary' : 'bg-fb-surface-elevated opacity-50'
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-base font-bold text-white">Gửi đánh giá</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleGoHome} className="items-center py-2 mb-8">
          <Text className="text-xs font-semibold text-fb-muted">Để sau, quay về trang chủ</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
