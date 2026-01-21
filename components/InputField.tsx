import React from 'react';
import { View, TextInput, Text, TextInputProps } from 'react-native';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, error, ...props }) => {
  return (
    <View className="mb-4">
      {label && <Text className="text-gray-700 mb-2 font-medium">{label}</Text>}
      <TextInput
        className={`border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3`}
        {...props}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
};
