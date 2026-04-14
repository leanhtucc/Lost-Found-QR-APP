import React from 'react';
import { Text, View } from 'react-native';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface PasswordMatchIndicatorProps {
  show: boolean;
  isMatched: boolean;
}

export const PasswordMatchIndicator: React.FC<PasswordMatchIndicatorProps> = ({
  show,
  isMatched,
}) => {
  if (!show) return null;

  return (
    <View className="flex-row items-center mt-1.5 ml-1">
      {isMatched ? (
        <>
          <CheckCircle2 size={14} color={FIND_BACK.secondary} />
          <Text className="ml-1 text-[11px] text-fb-secondary">Mật khẩu khớp</Text>
        </>
      ) : (
        <>
          <Circle size={14} color={FIND_BACK.danger} />
          <Text className="ml-1 text-[11px] text-red-500">Mật khẩu không khớp</Text>
        </>
      )}
    </View>
  );
};
