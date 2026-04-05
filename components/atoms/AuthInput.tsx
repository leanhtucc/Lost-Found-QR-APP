import React, { useState } from 'react';
import { View, TextInput, Text, TextInputProps, TouchableOpacity } from 'react-native';
import { cn } from '@/lib/cn';

interface AuthInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  className,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-gray-400 text-xs font-semibold tracking-wider mb-2 uppercase">
          {label}
        </Text>
      )}

      <View
        className={cn(
          'flex-row items-center h-[56px] rounded-2xl bg-[#1A1A24] px-4 border',
          error ? 'border-red-500' : isFocused ? 'border-[#7C6AF6]' : 'border-transparent',
          className
        )}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}

        <TextInput
          className="flex-1 text-white text-[15px] h-full"
          placeholderTextColor="#9CA3AF"
          onFocus={e => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={e => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity
            className="ml-3 p-1"
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text className="text-red-500 text-[13px] mt-2">{error}</Text> : null}
    </View>
  );
};
