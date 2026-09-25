import React from 'react';
import { Modal, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { FIND_BACK } from '@constants/theme';

export interface OverlayLoadingProps {
  visible: boolean;
  message?: string;
  subMessage?: string;
}

export const OverlayLoading: React.FC<OverlayLoadingProps> = ({
  visible,
  message = 'Đang đăng nhập...',
  subMessage = 'Vui lòng chờ trong giây lát...',
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        // Prevent back button dismiss during loading
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color={FIND_BACK.primary} />
          </View>
          <Text style={styles.message}>{message}</Text>
          {subMessage ? <Text style={styles.subMessage}>{subMessage}</Text> : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 15, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: '#17171F',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  spinnerContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(124, 106, 246, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(124, 106, 246, 0.25)',
  },
  message: {
    fontSize: 16,
    fontWeight: '700',
    color: FIND_BACK.bodyText,
    textAlign: 'center',
  },
  subMessage: {
    fontSize: 13,
    color: FIND_BACK.mutedText,
    textAlign: 'center',
    marginTop: 6,
  },
});

export default OverlayLoading;
