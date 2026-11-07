import React, { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { cn } from '@/lib/cn';

export type ChipTone = 'primary' | 'signal' | 'success' | 'danger' | 'neutral';

const tones: Record<ChipTone, { box: string; text: string }> = {
  primary: { box: 'bg-fb-primary/15 border-fb-primary/30', text: 'text-fb-primary-light' },
  signal: { box: 'bg-fb-tertiary/15 border-fb-tertiary/35', text: 'text-fb-tertiary' },
  success: { box: 'bg-fb-secondary/15 border-fb-secondary/30', text: 'text-fb-secondary' },
  danger: { box: 'bg-fb-danger/15 border-fb-danger/35', text: 'text-fb-danger' },
  neutral: { box: 'bg-fb-surface-elevated border-fb-border-glass', text: 'text-fb-muted' },
};

interface ChipProps {
  label: string;
  tone?: ChipTone;
  icon?: ReactNode;
  className?: string;
}

/** Status pill. Always carries a text label so colour is never the only signal. */
export const Chip: React.FC<ChipProps> = ({ label, tone = 'neutral', icon, className }) => (
  <View
    className={cn(
      'flex-row items-center gap-1.5 self-start rounded-full border px-3 py-1',
      tones[tone].box,
      className
    )}
  >
    {icon}
    <Text className={cn('text-xs font-semibold', tones[tone].text)}>{label}</Text>
  </View>
);
