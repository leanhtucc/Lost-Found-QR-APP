import React from 'react';
import { Text, View } from 'react-native';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface RuleItem {
  id: string;
  label: string;
  passed: boolean;
}

interface PasswordRulesListProps {
  rules: RuleItem[];
}

export const PasswordRulesList: React.FC<PasswordRulesListProps> = ({ rules }) => {
  return (
    <View className="mt-2 bg-fb-surface-muted rounded-xl p-3 border border-fb-border-subtle">
      <View className="flex-row flex-wrap">
        {rules.map(rule => (
          <View key={rule.id} className="flex-row items-center mr-3 mb-1">
            {rule.passed ? (
              <CheckCircle2 size={14} color={FIND_BACK.secondary} />
            ) : (
              <Circle size={14} color={FIND_BACK.labelText} />
            )}
            <Text
              className={`ml-1.5 text-[11px] ${rule.passed ? 'text-fb-secondary' : 'text-fb-muted'}`}
            >
              {rule.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
