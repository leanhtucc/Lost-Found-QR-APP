/**
 * LoadingState Component
 * Premium dark loading skeleton
 */

import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

const C = {
  bg: '#0B0B0C',
  surface: '#18181B',
  purple: '#8B5CF6',
  textMuted: '#71717A',
};

export const LoadingState: React.FC = () => {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}
    >
      <ActivityIndicator size="large" color={C.purple} />
      <Text style={{ color: C.textMuted, marginTop: 16, fontSize: 14 }}>Đang tải thông báo...</Text>

      {/* Skeleton cards */}
      <View style={{ width: '100%', paddingHorizontal: 20, marginTop: 32, gap: 12 }}>
        {[0, 1, 2].map(i => (
          <View
            key={i}
            style={{
              height: 88,
              borderRadius: 16,
              backgroundColor: C.surface,
              opacity: 0.6 - i * 0.15,
            }}
          />
        ))}
      </View>
    </Animated.View>
  );
};
