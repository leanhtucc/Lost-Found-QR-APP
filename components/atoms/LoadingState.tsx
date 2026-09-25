import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { cn } from '@/lib/cn';
import { FIND_BACK } from '@/constants/theme';

export interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Đang tải dữ liệu...',
  subMessage,
  className,
}) => {
  return (
    <View className={cn('flex-1 items-center justify-center p-6', className)}>
      <View className="h-14 w-14 items-center justify-center rounded-2xl border border-fb-primary/20 bg-fb-primary/10">
        <ActivityIndicator size="large" color={FIND_BACK.primaryLight} />
      </View>
      <Text className="mt-4 text-center text-sm font-semibold text-fb-content">{message}</Text>
      {subMessage ? (
        <Text className="mt-1 text-center text-xs text-fb-muted">{subMessage}</Text>
      ) : null}
    </View>
  );
};

export default LoadingState;
