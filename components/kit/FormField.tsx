import React, { forwardRef, useState, type ReactNode } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';
import { cn } from '@/lib/cn';

interface FormFieldProps extends TextInputProps {
  label: string;
  icon?: ReactNode;
  /** Text shown before the input, e.g. a country code. */
  prefix?: string;
  error?: string | null;
  success?: boolean;
  hint?: string;
  /** Adds a show/hide toggle and keeps entry secure while hidden. */
  password?: boolean;
}

/** Labelled input: visible label, focus ring, inline error, accessible password toggle. */
export const FormField = forwardRef<TextInput, FormFieldProps>(function FormField(
  { label, icon, prefix, error, success, hint, password, onFocus, onBlur, ...rest },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  const border = error
    ? 'border-fb-danger'
    : focused
      ? 'border-fb-primary'
      : success
        ? 'border-fb-secondary'
        : 'border-fb-border-glass';

  return (
    <View className="w-full">
      <Text className="mb-2 text-sm font-semibold text-fb-content">{label}</Text>
      <View
        className={cn(
          'min-h-[56px] flex-row items-center rounded-2xl border bg-fb-surface px-4',
          border,
          focused && 'bg-fb-surface-muted'
        )}
      >
        {icon ? <View className="mr-3">{icon}</View> : null}
        {prefix ? (
          <Text className="mr-2 text-base font-semibold text-fb-muted">{prefix}</Text>
        ) : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={FIND_BACK.labelText}
          selectionColor={FIND_BACK.primaryLight}
          className="min-h-[56px] flex-1 text-base text-fb-content"
          secureTextEntry={password && !visible}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {password ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            hitSlop={10}
            onPress={() => setVisible(v => !v)}
            className="ml-2 h-11 w-11 items-center justify-center"
          >
            {visible ? (
              <EyeOff size={20} color={FIND_BACK.mutedText} />
            ) : (
              <Eye size={20} color={FIND_BACK.mutedText} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text accessibilityRole="alert" className="mt-2 text-sm text-fb-danger">
          {error}
        </Text>
      ) : hint ? (
        <Text className="mt-2 text-xs text-fb-muted">{hint}</Text>
      ) : null}
    </View>
  );
});
