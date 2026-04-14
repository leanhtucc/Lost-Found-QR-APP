import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface PasswordInputFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  secure: boolean;
  onToggleSecure: () => void;
  onChangeText: (value: string) => void;
  error?: string;
}

export const PasswordInputField: React.FC<PasswordInputFieldProps> = ({
  label,
  value,
  placeholder = '••••••••',
  secure,
  onToggleSecure,
  onChangeText,
  error,
}) => {
  return (
    <View>
      <Text className="text-sm font-medium text-fb-muted mb-2">{label}</Text>
      <View className="relative">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secure}
          autoCapitalize="none"
          className="h-14 border border-fb-border-subtle rounded-xl px-4 pr-12 text-base text-white bg-fb-neutral"
          placeholderTextColor={FIND_BACK.labelText}
        />
        <TouchableOpacity onPress={onToggleSecure} className="absolute right-4 top-4">
          {secure ? (
            <Eye size={22} color={FIND_BACK.mutedText} />
          ) : (
            <EyeOff size={22} color={FIND_BACK.mutedText} />
          )}
        </TouchableOpacity>
      </View>
      {error ? <Text className="text-red-500 text-sm mt-1">{error}</Text> : null}
    </View>
  );
};
