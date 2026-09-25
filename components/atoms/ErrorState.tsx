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
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10">
        <AlertTriangle size={32} color={FIND_BACK.danger} strokeWidth={1.8} />
      </View>
      <Text className="text-center text-base font-bold text-fb-content">{title}</Text>
      <Text className="mt-1.5 max-w-[290px] text-center text-xs leading-5 text-fb-muted">
        {message}
      </Text>

      <View className="mt-5 flex-row items-center gap-3">
        {onRetry ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onRetry}
            className="flex-row items-center gap-2 rounded-xl bg-fb-primary px-5 py-2.5"
          >
            <RefreshCw size={14} color={FIND_BACK.bodyText} />
            <Text className="text-xs font-semibold text-fb-content">{retryTitle}</Text>
          </TouchableOpacity>
        ) : null}

        {secondaryActionTitle && onSecondaryAction ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onSecondaryAction}
            className="rounded-xl border border-fb-border-subtle bg-fb-surface-elevated px-4 py-2.5"
          >
            <Text className="text-xs font-medium text-fb-muted">{secondaryActionTitle}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default ErrorState;
