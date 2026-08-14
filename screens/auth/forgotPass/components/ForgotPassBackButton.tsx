import React from 'react';
import { TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface ForgotPassBackButtonProps {
  onPress: () => void;
}

export const ForgotPassBackButton: React.FC<ForgotPassBackButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Quay lại"
      className="mb-8 h-11 w-11 items-center justify-center rounded-2xl border border-fb-border-subtle bg-fb-surface-elevated"
    >
      <ChevronLeft size={24} color={FIND_BACK.bodyText} />
    </TouchableOpacity>
  );
};
