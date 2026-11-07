import React, { type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}

/** Standard top bar: 44pt back target, title block, optional right action. */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, subtitle, onBack, right }) => (
  <View className="flex-row items-center px-4 pb-3 pt-2">
    {onBack ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
        onPress={onBack}
        hitSlop={8}
        className="mr-3 h-11 w-11 items-center justify-center rounded-full border border-fb-border-glass bg-fb-surface active:bg-fb-surface-elevated"
      >
        <ArrowLeft size={20} color={FIND_BACK.bodyText} />
      </Pressable>
    ) : null}
    <View className="flex-1">
      <Text className="text-xl font-bold text-fb-content" numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-xs text-fb-muted" numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
    {right ? <View className="ml-3">{right}</View> : null}
  </View>
);
