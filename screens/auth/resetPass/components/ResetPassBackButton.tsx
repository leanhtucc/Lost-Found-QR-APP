import React from 'react';
import { TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface ResetPassBackButtonProps {
  onPress: () => void;
}

export const ResetPassBackButton: React.FC<ResetPassBackButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-10 h-10 rounded-xl bg-fb-surface-muted items-center justify-center mb-8"
    >
      <ChevronLeft size={24} color={FIND_BACK.bodyText} />
    </TouchableOpacity>
  );
};
