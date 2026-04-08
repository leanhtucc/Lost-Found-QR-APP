import { cn } from '@/lib/cn';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, forwardRef, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export type AppButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outlined'
  | 'inverted'
  | 'danger'
  | 'success';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: AppButtonVariant;
  /** @deprecated Prefer children for flexible content */
  title?: string;
  children?: ReactNode;
  className?: string;
  textClassName?: string;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const shellBase =
  'min-h-[52px] w-full px-5 flex-row items-center justify-center rounded-fb active:opacity-90';

const variantShell: Record<AppButtonVariant, string> = {
  primary: '',
  secondary: 'bg-fb-surface-elevated border border-fb-border-glass',
  outlined: 'bg-transparent border border-white/30',
  inverted: 'bg-white',
  danger: 'bg-fb-danger',
  success: 'bg-fb-success',
};

const variantText: Record<AppButtonVariant, string> = {
  primary: 'text-[#0A0A0F] font-semibold text-body-small',
  secondary: 'text-white font-semibold text-body-small',
  outlined: 'text-white font-semibold text-body-small',
  inverted: 'text-fb-neutral font-semibold text-body-small',
  danger: 'text-white font-semibold text-body-small',
  success: 'text-white font-semibold text-body-small',
};

const gradientInnerStyle: ViewStyle = {
  minHeight: 52,
  paddingHorizontal: 20,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
};

const ButtonInner = forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(function Button(
  {
    variant = 'primary',
    title,
    children,
    className,
    textClassName,
    loading,
    leftIcon,
    rightIcon,
    disabled,
    style,
    ...rest
  },
  ref
) {
  const renderLabel = () => {
    if (children !== undefined && children !== null) {
      if (typeof children === 'string' || typeof children === 'number') {
        return <Text className={cn(variantText[variant], textClassName)}>{children}</Text>;
      }
      return children;
    }
    if (title) {
      return <Text className={cn(variantText[variant], textClassName)}>{title}</Text>;
    }
    return null;
  };

  const content = loading ? (
    <ActivityIndicator color={variant === 'inverted' ? '#0A0A0F' : '#FFFFFF'} />
  ) : (
    <>
      {leftIcon ? <View className="mr-2">{leftIcon}</View> : null}
      {renderLabel()}
      {rightIcon ? <View className="ml-2">{rightIcon}</View> : null}
    </>
  );

  const outerClass = cn(shellBase, variant !== 'primary' && variantShell[variant], className);

  if (variant === 'primary') {
    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        disabled={disabled || loading}
        style={style as StyleProp<ViewStyle>}
        {...rest}
      >
        <View className="w-full overflow-hidden rounded-fb">
          <LinearGradient
            colors={['#978CF8', '#7C6AF6', '#6B5AE8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={gradientInnerStyle}
          >
            {content}
          </LinearGradient>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      disabled={disabled || loading}
      className={outerClass}
      style={style as StyleProp<ViewStyle>}
      {...rest}
    >
      {content}
    </Pressable>
  );
});

ButtonInner.displayName = 'Button';

export const Button = memo(ButtonInner);
