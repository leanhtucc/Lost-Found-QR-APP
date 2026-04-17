import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { X } from 'lucide-react-native';
import { REPORT_COLORS, REPORT_LAYOUT } from '../constants/theme';

interface ReportHeaderProps {
  title: string;
  onBack: () => void;
  rightLabel?: string;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ title, onBack, rightLabel }) => {
  return (
    <View
      style={{
        paddingHorizontal: REPORT_LAYOUT.horizontalPadding,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
        backgroundColor: 'rgba(8,8,15,0.88)',
      }}
    >
      <TouchableOpacity onPress={onBack} activeOpacity={0.8}>
        <X size={20} color={REPORT_COLORS.accent} />
      </TouchableOpacity>

      <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 28, fontWeight: '700' }}>
        {title}
      </Text>

      {rightLabel ? (
        <Text
          style={{
            color: REPORT_COLORS.accent,
            fontSize: 12,
            letterSpacing: 1.2,
            fontWeight: '700',
            textTransform: 'uppercase',
          }}
        >
          {rightLabel}
        </Text>
      ) : (
        <View style={{ width: 20 }} />
      )}
    </View>
  );
};
