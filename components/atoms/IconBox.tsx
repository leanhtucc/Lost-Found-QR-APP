import { cn } from '@/lib/cn';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, forwardRef, type ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

export type IconBoxTone = 'primary' | 'secondary' | 'tertiary' | 'muted';

export interface IconBoxProps extends ViewProps {
  children: ReactNode;
  tone?: IconBoxTone;
  /** Square with rounded corners */
  size?: 'sm' | 'md';
  className?: string;
  /** Solid / frosted instead of gradient */
  variant?: 'gradient' | 'glass';
}

const sizeMap = {
  sm: 'h-10 w-10 rounded-xl',
  md: 'h-12 w-12 rounded-fb',
};

const gradientFor: Record<IconBoxTone, [string, string]> = {
  primary: ['#978CF8', '#7C6AF6'],
  secondary: ['#47D4A8', '#2ECC8B'],
  tertiary: ['#F89674', '#F4845F'],
  muted: ['#3F3F46', '#27272A'],
};

const glassFor: Record<IconBoxTone, string> = {
  primary: 'bg-fb-primary-dim border-fb-primary/40',
  secondary: 'bg-fb-secondary-dim border-fb-secondary/40',
  tertiary: 'bg-fb-tertiary-dim border-fb-tertiary/40',
  muted: 'bg-white/5 border-fb-border-glass',
};

const IconBoxInner = forwardRef<View, IconBoxProps>(function IconBox(
  { children, tone = 'primary', size = 'md', className, variant = 'gradient', ...rest },
  ref
) {
  const boxClass = cn('items-center justify-center border', sizeMap[size], className);

  if (variant === 'glass') {
    return (
      <View ref={ref} className={cn(boxClass, glassFor[tone])} {...rest}>
        {children}
      </View>
    );
  }

  const [a, b] = gradientFor[tone];
  return (
    <View ref={ref} className={cn(boxClass, 'overflow-hidden border-transparent p-0')} {...rest}>
      <LinearGradient
        colors={[a, b]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={StyleSheet.absoluteFillObject} className="items-center justify-center">
        {children}
      </View>
    </View>
  );
});

IconBoxInner.displayName = 'IconBox';

export const IconBox = memo(IconBoxInner);
