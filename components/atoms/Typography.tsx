import { cn } from '@/lib/cn';
import { memo, forwardRef } from 'react';
import { Text, type TextProps } from 'react-native';

export type TypographyVariant = 'headline' | 'title' | 'body' | 'bodySm' | 'label' | 'caption';

export interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  className?: string;
  /** Visually bold without relying on nested Text */
  emphasis?: boolean;
}

const variantClass: Record<TypographyVariant, string> = {
  headline: 'font-display text-display-headline font-bold text-white',
  title: 'font-display text-display-title font-bold text-white',
  body: 'text-body-default text-fb-content',
  bodySm: 'text-body-small text-fb-content',
  label: 'text-label-default text-fb-label',
  caption: 'text-caption-default text-fb-muted',
};

const TypographyInner = forwardRef<Text, TypographyProps>(function Typography(
  { variant = 'body', className, emphasis, allowFontScaling = true, children, ...rest },
  ref
) {
  const weight = emphasis && (variant === 'body' || variant === 'bodySm') ? ' font-semibold' : '';

  return (
    <Text
      ref={ref}
      allowFontScaling={allowFontScaling}
      className={cn('font-sans', variantClass[variant], weight, className)}
      {...rest}
    >
      {children}
    </Text>
  );
});

TypographyInner.displayName = 'Typography';

export const Typography = memo(TypographyInner);
