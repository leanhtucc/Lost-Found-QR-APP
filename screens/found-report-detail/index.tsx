import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import { RootStackParamList } from '@navigation/index';
import { foundReportsApi, FoundReport } from '@/services/reports/found';
import { CATEGORY_CONFIG } from '@/types/item';
import { FIND_BACK } from '@constants/theme';

export default function FoundReportDetailScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'FoundReportDetails'>>();
  const [report, setReport] = useState<FoundReport | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt(value => value + 1), []);

  useEffect(() => {
    let active = true;
    setError('');
    setReport(null);
    void foundReportsApi
      .get(params.reportId)
      .then(data => {
        if (active) setReport(data);
      })
      .catch(reason => {
        if (active) setError(reason instanceof Error ? reason.message : 'Không thể tải bài đăng.');
      });
    return () => {
      active = false;
    };
  }, [params.reportId, attempt]);

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
        </ScrollView>
      ) : (
        <ActivityIndicator color={FIND_BACK.primaryLight} />
      )}
    </SafeAreaView>
  );
}
