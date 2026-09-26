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
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl border border-fb-border-subtle bg-fb-surface-elevated">
        {icon || <PackageOpen size={32} color={FIND_BACK.primaryLight} strokeWidth={1.75} />}
      </View>
      <Text className="text-center text-base font-bold text-fb-content">{title}</Text>
      {description ? (
        <Text className="mt-1.5 max-w-[280px] text-center text-xs leading-5 text-fb-muted">
          {description}
        </Text>
      ) : null}
      {actionTitle && onAction ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionTitle}
          className="mt-4 rounded-xl border border-fb-primary/25 bg-fb-primary/10 px-5 py-2.5"
        >
          <Text className="text-xs font-semibold text-fb-primary-light">{actionTitle}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default EmptyState;
