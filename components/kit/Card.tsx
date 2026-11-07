import React, { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { cn } from '@/lib/cn';

interface CardProps extends ViewProps {
  children: ReactNode;
  className?: string;
  /** base = surface, raised = elevated, tint = primary highlight, warn = amber, ok = green, bad = red */
  tone?: 'base' | 'raised' | 'tint' | 'warn' | 'ok' | 'bad';
}

const toneClass = {
  base: 'bg-fb-surface border-fb-border-glass',
  raised: 'bg-fb-surface-elevated border-fb-border-glass',
  tint: 'bg-fb-primary/10 border-fb-primary/30',
  warn: 'bg-fb-tertiary/10 border-fb-tertiary/35',
  ok: 'bg-fb-secondary/10 border-fb-secondary/30',
  bad: 'bg-fb-danger/10 border-fb-danger/35',
} as const;

export const Card: React.FC<CardProps> = ({ children, className, tone = 'base', ...rest }) => (
  <View className={cn('rounded-3xl border p-5', toneClass[tone], className)} {...rest}>
    {children}
  </View>
);
