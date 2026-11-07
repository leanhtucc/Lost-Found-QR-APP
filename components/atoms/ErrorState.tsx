import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { cn } from '@/lib/cn';
import { FIND_BACK } from '@/constants/theme';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryTitle?: string;
  secondaryActionTitle?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Không thể tải dữ liệu',
  message,
  onRetry,
  retryTitle = 'Thử lại',
  secondaryActionTitle,
  onSecondaryAction,
  className,
}) => {
  return (
    <View className={cn('flex-1 items-center justify-center p-6 text-center', className)}>
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-3xl border border-fb-danger/30 bg-fb-danger/10">
        <AlertTriangle size={36} color={FIND_BACK.danger} strokeWidth={1.8} />
      </View>
      <Text className="text-center text-lg font-bold text-fb-content">{title}</Text>
      <Text className="mt-2 max-w-[300px] text-center text-sm leading-5 text-fb-muted">
        {message}
      </Text>

      <View className="mt-5 flex-row items-center gap-3">
        {onRetry ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel={retryTitle}
            className="min-h-[48px] flex-row items-center gap-2 rounded-2xl bg-fb-primary px-6"
          >
            <RefreshCw size={16} color="#FFFFFF" />
            <Text className="text-sm font-semibold text-white">{retryTitle}</Text>
          </TouchableOpacity>
        ) : null}

        {secondaryActionTitle && onSecondaryAction ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onSecondaryAction}
            accessibilityRole="button"
            accessibilityLabel={secondaryActionTitle}
            className="min-h-[48px] justify-center rounded-2xl border border-fb-border-glass bg-fb-surface-elevated px-5"
          >
            <Text className="text-sm font-medium text-fb-muted">{secondaryActionTitle}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default ErrorState;
