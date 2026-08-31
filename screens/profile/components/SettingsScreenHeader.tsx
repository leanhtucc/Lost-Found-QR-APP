import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { FIND_BACK } from '@/constants/theme';

interface SettingsScreenHeaderProps {
  title: string;
  onBack: () => void;
}

export const SettingsScreenHeader: React.FC<SettingsScreenHeaderProps> = ({ title, onBack }) => (
  <View className="flex-row items-center border-b border-fb-border-subtle px-4 py-3">
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Quay lại"
      onPress={onBack}
      className="h-10 w-10 items-center justify-center rounded-full bg-fb-surface"
    >
      <ArrowLeft size={21} color={FIND_BACK.bodyText} />
    </TouchableOpacity>
    <Text className="ml-3 text-xl font-bold text-fb-content">{title}</Text>
  </View>
);
