import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import { REPORT_COLORS, REPORT_LAYOUT } from '../constants/theme';

interface ActionFooterProps {
  label: string;
  onPress: () => void;
  bottomInset: number;
  disabled?: boolean;
}

export const ActionFooter: React.FC<ActionFooterProps> = ({
  label,
  onPress,
  bottomInset,
  disabled = false,
}) => {
  return (
    <View
      style={{
        paddingHorizontal: REPORT_LAYOUT.horizontalPadding,
        paddingTop: 18,
        paddingBottom: Math.max(20, bottomInset + 10),
        backgroundColor: 'rgba(8,8,15,0.92)',
      }}
    >
      <TouchableOpacity activeOpacity={0.86} onPress={onPress} disabled={disabled}>
        <LinearGradient
          colors={disabled ? ['#5a5b62', '#5a5b62'] : REPORT_COLORS.ctaGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            height: 56,
            borderRadius: 18,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            shadowColor: REPORT_COLORS.accentGlow,
            shadowOpacity: 0.35,
            shadowRadius: 16,
          }}
        >
          <Text style={{ color: REPORT_COLORS.ctaText, fontSize: 20, fontWeight: '800' }}>
            {label}
          </Text>
          <ArrowRight size={18} color={REPORT_COLORS.ctaText} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};
