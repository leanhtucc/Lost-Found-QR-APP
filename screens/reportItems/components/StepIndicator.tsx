import React from 'react';
import { View } from 'react-native';
import { REPORT_COLORS } from '../constants/theme';

interface StepIndicatorProps {
  step: number;
  total?: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ step, total = 4 }) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      {Array.from({ length: total }).map((_, index) => {
        const current = index + 1;
        const isActive = current === step;
        const isDone = current < step;

        return (
          <View
            key={current}
            style={{
              width: 48,
              height: 6,
              borderRadius: 999,
              backgroundColor: isActive || isDone ? REPORT_COLORS.accentStrong : '#2a2a35',
              shadowColor: isActive ? REPORT_COLORS.accentGlow : 'transparent',
              shadowOpacity: isActive ? 1 : 0,
              shadowRadius: isActive ? 8 : 0,
            }}
          />
        );
      })}
    </View>
  );
};
