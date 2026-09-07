import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Send } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';
import { FONT_FAMILY } from '@constants/fonts';

interface SubmitFooterProps {
  isSubmitting: boolean;
  isDisabled: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
}

export const SubmitFooter: React.FC<SubmitFooterProps> = ({
  isSubmitting,
  isDisabled,
  canSubmit,
  onSubmit,
}) => {
  return (
    <View style={styles.footer}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Gửi báo cáo đồ nhặt được"
        onPress={onSubmit}
        disabled={isDisabled}
        accessibilityState={{ disabled: !canSubmit, busy: isSubmitting }}
        style={({ pressed }) => [
          styles.submitButton,
          pressed && styles.submitButtonPressed,
          !canSubmit && styles.submitButtonDisabled,
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={FIND_BACK.neutral} />
        ) : (
          <Send size={20} color={FIND_BACK.neutral} />
        )}
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Đang gửi...' : 'Đăng đồ nhặt được'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  submitButton: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: FIND_BACK.secondary,
  },
  submitButtonPressed: {
    opacity: 0.82,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: FIND_BACK.neutral,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 15,
  },
});
