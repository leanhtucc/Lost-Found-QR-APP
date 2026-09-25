import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/cn';
import { FIND_BACK } from '@/constants/theme';

export type AssetStatus = 'SAFE' | 'LOST' | 'FOUND' | 'RESOLVED' | 'PENDING_PAYMENT' | string;

export interface StatusBadgeProps {
  status: AssetStatus;
  label?: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

interface StatusConfig {
  label: string;
  dotColor: string;
  textColor: string;
  bgClass: string;
  borderClass: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  SAFE: {
    label: 'An toàn',
    dotColor: FIND_BACK.secondary,
    textColor: 'text-fb-secondary',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/20',
  },
  LOST: {
    label: 'Báo mất',
    dotColor: FIND_BACK.danger,
    textColor: 'text-fb-danger',
    bgClass: 'bg-rose-500/10',
    borderClass: 'border-rose-500/20',
  },
  FOUND: {
    label: 'Nhặt được',
    dotColor: FIND_BACK.info,
    textColor: 'text-fb-info',
    bgClass: 'bg-indigo-400/10',
    borderClass: 'border-indigo-400/25',
  },
  RESOLVED: {
    label: 'Đã hoàn trả',
    dotColor: FIND_BACK.primaryLight,
    textColor: 'text-fb-primary-light',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-500/20',
  },
  PENDING_PAYMENT: {
    label: 'Chờ thanh toán',
    dotColor: FIND_BACK.tertiary,
    textColor: 'text-fb-tertiary',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/20',
  },
};

const DEFAULT_CONFIG: StatusConfig = {
  label: 'Không xác định',
  dotColor: FIND_BACK.labelText,
  textColor: 'text-fb-label',
  bgClass: 'bg-zinc-500/10',
  borderClass: 'border-zinc-500/20',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  showDot = true,
  className,
}) => {
  const normalizedStatus = String(status || '').toUpperCase();
  const config = STATUS_MAP[normalizedStatus] || DEFAULT_CONFIG;
  const displayLabel = label || config.label;

  const isSmall = size === 'sm';

  return (
    <View
      className={cn(
        'flex-row items-center self-start rounded-full border',
        config.bgClass,
        config.borderClass,
        isSmall ? 'px-2 py-0.5' : 'px-3 py-1',
        className
      )}
    >
      {showDot && (
        <View
          className={cn('rounded-full mr-1.5', isSmall ? 'h-1.5 w-1.5' : 'h-2 w-2')}
          style={{ backgroundColor: config.dotColor }}
        />
      )}
      <Text
        className={cn(
          'font-semibold',
          config.textColor,
          isSmall ? 'text-[10px] leading-3' : 'text-xs leading-4'
        )}
      >
        {displayLabel}
      </Text>
    </View>
  );
};

export default StatusBadge;
