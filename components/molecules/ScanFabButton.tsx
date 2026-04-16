import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

interface ScanFabButtonProps {
  onPress: () => void;
  accessibilityLabel?: string;
  isFocused?: boolean;
}

export const ScanFabButton: React.FC<ScanFabButtonProps> = ({
  onPress,
  accessibilityLabel = 'Mở quét mã QR',
  isFocused = false,
}) => {
  return (
    <View className="absolute -top-7 self-center">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        className="h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#2ECC8B]"
        style={{
          shadowColor: '#000000',
          shadowOpacity: 0.2,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
          elevation: 10,
          transform: [{ scale: isFocused ? 1.03 : 1 }],
        }}
      >
        <MaterialIcons name="qr-code-scanner" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
};

export default ScanFabButton;
