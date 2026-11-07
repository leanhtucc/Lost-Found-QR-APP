import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ShieldAlert, LogIn } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface SessionExpiredModalProps {
  visible: boolean;
  onConfirm: () => void;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ visible, onConfirm }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        // Prevent closing modal by back button
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <ShieldAlert size={36} color={FIND_BACK.tertiary} />
          </View>

          <Text style={styles.title} accessibilityRole="header">
            Phiên đăng nhập đã hết hạn
          </Text>

          <Text style={styles.description}>
            Vì an toàn, bạn cần đăng nhập lại để tiếp tục sử dụng ứng dụng.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onConfirm}
            style={styles.button}
            accessibilityRole="button"
            accessibilityLabel="Đăng nhập lại"
          >
            <LogIn size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Đăng nhập lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 20, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#12203A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 24,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 176, 32, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 176, 32, 0.3)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: FIND_BACK.bodyText,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: FIND_BACK.mutedText,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    backgroundColor: FIND_BACK.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default SessionExpiredModal;
