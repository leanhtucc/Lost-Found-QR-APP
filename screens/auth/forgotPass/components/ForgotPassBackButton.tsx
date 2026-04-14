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
      className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mb-8"
    >
      <ChevronLeft size={24} color={FIND_BACK.neutral} />
    </TouchableOpacity>
  );
};
