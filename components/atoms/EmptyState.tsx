import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { PackageOpen } from 'lucide-react-native';
import { cn } from '@/lib/cn';
import { FIND_BACK } from '@/constants/theme';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionTitle,
  onAction,
  className,
}) => {
  return (
    <View className={cn('items-center justify-center p-6 text-center', className)}>
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-3xl border border-fb-border-glass bg-fb-surface-elevated">
        {icon || <PackageOpen size={32} color={FIND_BACK.primaryLight} strokeWidth={1.75} />}
      </View>
      <Text className="text-center text-lg font-bold text-fb-content">{title}</Text>
      {description ? (
        <Text className="mt-2 max-w-[300px] text-center text-sm leading-5 text-fb-muted">
          {description}
        </Text>
      ) : null}
      {actionTitle && onAction ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionTitle}
          className="mt-5 min-h-[48px] justify-center rounded-2xl border border-fb-primary/30 bg-fb-primary/10 px-6"
        >
          <Text className="text-sm font-semibold text-fb-primary-light">{actionTitle}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default EmptyState;
