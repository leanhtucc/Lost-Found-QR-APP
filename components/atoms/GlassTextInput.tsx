import { cn } from '@/lib/cn';
import { Search } from 'lucide-react-native';
import { memo, forwardRef, type ReactNode } from 'react';
import { FIND_BACK } from '@constants/theme';
import { TextInput, View, type TextInputProps } from 'react-native';

export type GlassTextInputVariant = 'text' | 'search';

export interface GlassTextInputProps extends TextInputProps {
  variant?: GlassTextInputVariant;
  className?: string;
  containerClassName?: string;
  /** Shown on the left (e.g. lock / mail icon). Ignored for search variant (fixed search icon). */
  leftAdornment?: ReactNode;
  error?: boolean;
}

const GlassTextInputInner = forwardRef<TextInput, GlassTextInputProps>(function GlassTextInput(
  {
    variant = 'text',
    className,
    containerClassName,
    leftAdornment,
    error,
    placeholderTextColor = FIND_BACK.labelText,
    editable = true,
    secureTextEntry,
    autoCorrect,
    ...rest
  },
  ref
) {
  const borderClass = error ? 'border-fb-danger' : 'border-fb-border-glass';
  const safeAutoCorrect = secureTextEntry ? false : autoCorrect;

  return (
    <View
      className={cn(
        'flex-row items-center rounded-fb border bg-fb-surface/70 px-3',
        borderClass,
        !editable && 'opacity-60',
        containerClassName
      )}
    >
      {variant === 'search' ? (
        <View className="mr-2 opacity-80">
          <Search
            size={20}
            color={FIND_BACK.mutedText}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        </View>
      ) : leftAdornment ? (
        <View className="mr-2">{leftAdornment}</View>
      ) : null}
      <TextInput
        ref={ref}
        {...rest}
        secureTextEntry={secureTextEntry}
        allowFontScaling={false}
        className={cn('min-h-[48px] flex-1 py-3 text-body-default text-fb-content', className)}
        placeholderTextColor={placeholderTextColor}
        editable={editable}
        autoCorrect={safeAutoCorrect}
      />
    </View>
  );
});

GlassTextInputInner.displayName = 'GlassTextInput';

export const GlassTextInput = memo(GlassTextInputInner);
