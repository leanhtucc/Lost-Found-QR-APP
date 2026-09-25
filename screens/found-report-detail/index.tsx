import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import { RootStackParamList } from '@navigation/index';
import { foundReportsApi, FoundReport } from '@/services/reports/found';
import { CATEGORY_CONFIG } from '@/types/item';
import { FIND_BACK } from '@constants/theme';
import type { FoundReportClaim } from '@/services/reports/found';
import type { StackNavigationProp } from '@react-navigation/stack';

export default function FoundReportDetailScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'FoundReportDetails'>>();
  const [report, setReport] = useState<FoundReport | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [proof, setProof] = useState('');
  const [myClaim, setMyClaim] = useState<FoundReportClaim | null>(null);
  const [claims, setClaims] = useState<FoundReportClaim[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const retry = useCallback(() => setAttempt(value => value + 1), []);

  useEffect(() => {
    let active = true;
    setError('');
    setReport(null);
    void foundReportsApi
      .get(params.reportId)
      .then(async data => {
        if (!active) return;
        setReport(data);
        if (data.isOwn) setClaims(await foundReportsApi.getClaims(params.reportId));
        else setMyClaim(await foundReportsApi.getMyClaim(params.reportId));
      })
      .catch(reason => {
        if (active) setError(reason instanceof Error ? reason.message : 'Không thể tải bài đăng.');
      });
    return () => {
      active = false;
    };
  }, [params.reportId, attempt]);

  const submitClaim = async () => {
    if (proof.trim().length < 10) {
      Alert.alert('Thiếu thông tin', 'Hãy mô tả ít nhất 10 ký tự về dấu hiệu chỉ chủ sở hữu biết.');
      return;
    }
    setSubmitting(true);
    try {
      setMyClaim(await foundReportsApi.createClaim(params.reportId, proof.trim()));
      setProof('');
    } catch (reason) {
      Alert.alert('Không thể gửi', reason instanceof Error ? reason.message : 'Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const reviewClaim = async (claim: FoundReportClaim, decision: 'accept' | 'reject') => {
    setSubmitting(true);
    try {
      const result = await foundReportsApi.reviewClaim(params.reportId, claim.id, decision);
      if (decision === 'accept' && result.channel?.channelId) {
        navigation.navigate('Chat', {
          channelId: result.channel.channelId,
          itemName: report?.name || 'Đồ nhặt được',
          userName: claim.claimant?.displayName || 'Chủ sở hữu',
        });
      } else retry();
    } catch (reason) {
      Alert.alert(
        'Không thể xử lý',
        reason instanceof Error ? reason.message : 'Vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-fb-canvas">
      <View className="flex-row items-center gap-4 px-5 py-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color={FIND_BACK.bodyText} size={24} />
        </Pressable>
        <Text className="text-lg font-semibold text-white">Đồ nhặt được</Text>
      </View>
      {error ? (
        <View className="gap-4 p-6">
          <Text className="text-white">{error}</Text>
          <Pressable accessibilityRole="button" onPress={retry}>
            <Text className="text-fb-primary-light">Thử lại</Text>
          </Pressable>
        </View>
      ) : report ? (
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
          <Image
            source={{ uri: report.imagePublicUrl }}
            style={{ width: '100%', height: 280, borderRadius: 20 }}
            resizeMode="contain"
          />
          <Text className="text-sm text-fb-primary-light">
            {report.resolvedAt ? 'Đã trả lại' : 'Nhặt được · Đang tìm chủ sở hữu'}
          </Text>
          <Text className="text-2xl font-bold text-white">{report.name}</Text>
          <Text className="text-gray-400">
            {CATEGORY_CONFIG[report.category]?.label ?? report.category}
          </Text>
          {report.description ? (
            <Text className="text-base text-white">{report.description}</Text>
          ) : null}
          <View className="flex-row gap-2">
            <MapPin size={20} color={FIND_BACK.primaryLight} />
            <Text className="flex-1 text-base text-white">{report.address}</Text>
          </View>
          <Text className="text-sm text-gray-400">
            Đăng ngày {new Date(report.createdAt).toLocaleDateString('vi-VN')}
          </Text>
          {!report.resolvedAt && report.isOwn ? (
            <View className="gap-3 rounded-2xl border border-fb-border-subtle bg-fb-surface p-4">
              <Text className="text-base font-bold text-white">Yêu cầu nhận đồ</Text>
              {claims.length ? (
                claims.map(claim => (
                  <View key={claim.id} className="gap-2 rounded-xl bg-fb-surface-elevated p-3">
                    <Text className="font-semibold text-white">
                      {claim.claimant?.displayName || 'Người nhận'}
                    </Text>
                    <Text className="text-sm text-gray-300">{claim.ownershipProof}</Text>
                    <Text className="text-xs text-fb-primary-light">{claim.status}</Text>
                    {claim.status === 'PENDING' ? (
                      <View className="flex-row gap-3">
                        <Pressable
                          disabled={submitting}
                          onPress={() => void reviewClaim(claim, 'accept')}
                          className="rounded-lg bg-fb-secondary px-4 py-2"
                        >
                          <Text className="font-bold text-black">Chấp nhận</Text>
                        </Pressable>
                        <Pressable
                          disabled={submitting}
                          onPress={() => void reviewClaim(claim, 'reject')}
                          className="rounded-lg bg-fb-error/20 px-4 py-2"
                        >
                          <Text className="font-bold text-fb-error">Từ chối</Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>
                ))
              ) : (
                <Text className="text-sm text-gray-400">Chưa có yêu cầu nào.</Text>
              )}
            </View>
          ) : !report.resolvedAt ? (
            <View className="gap-3 rounded-2xl border border-fb-border-subtle bg-fb-surface p-4">
              <Text className="text-base font-bold text-white">Đây là đồ của bạn?</Text>
              {myClaim ? (
                <Text className="text-sm text-fb-primary-light">
                  Yêu cầu của bạn: {myClaim.status}
                </Text>
              ) : (
                <>
                  <TextInput
                    value={proof}
                    onChangeText={setProof}
                    multiline
                    maxLength={2000}
                    placeholder="Mô tả dấu hiệu riêng, nội dung bên trong hoặc bằng chứng sở hữu..."
                    placeholderTextColor={FIND_BACK.mutedText}
                    className="min-h-24 rounded-xl border border-fb-border-subtle bg-fb-surface-elevated p-3 text-white"
                  />
                  <Pressable
                    disabled={submitting}
                    onPress={() => void submitClaim()}
                    className="items-center rounded-xl bg-fb-primary py-3"
                  >
                    <Text className="font-bold text-white">Gửi bằng chứng sở hữu</Text>
                  </Pressable>
                </>
              )}
            </View>
          ) : null}
        </ScrollView>
      ) : (
        <ActivityIndicator color={FIND_BACK.primaryLight} />
      )}
    </SafeAreaView>
  );
}
