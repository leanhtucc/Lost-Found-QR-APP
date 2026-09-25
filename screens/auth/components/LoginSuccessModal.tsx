import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { CheckCircle2, ArrowRight } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

export interface LoginSuccessModalProps {
  visible: boolean;
  userName?: string;
  isNewUser?: boolean;
  onConfirm: () => void;
  autoDismissMs?: number;
}

export const LoginSuccessModal: React.FC<LoginSuccessModalProps> = ({
  visible,
  userName,
  isNewUser = false,
  onConfirm,
  autoDismissMs = 2000,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        onConfirm();
      }, autoDismissMs);

      return () => clearTimeout(timer);
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible, autoDismissMs, onConfirm, scaleAnim, opacityAnim]);

  const title = isNewUser ? 'Đăng ký thành công!' : 'Đăng nhập thành công!';
  const message = userName
    ? isNewUser
      ? `Chào mừng ${userName} đến với Lost & Found QR!`
      : `Chào mừng bạn quay trở lại, ${userName}!`
    : 'Chào mừng bạn quay trở lại với Lost & Found QR!';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onConfirm}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <CheckCircle2 size={40} color={FIND_BACK.secondary} />
          </View>

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.description}>{message}</Text>

          <TouchableOpacity activeOpacity={0.85} onPress={onConfirm} style={styles.button}>
            <Text style={styles.buttonText}>Vào trang chủ</Text>
            <ArrowRight size={18} color="#FFFFFF" style={styles.buttonIcon} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#17171F',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 139, 0.3)',
    padding: 24,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#2ECC8B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(46, 204, 139, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(46, 204, 139, 0.35)',
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
    lineHeight: 21,
    color: FIND_BACK.mutedText,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: FIND_BACK.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default LoginSuccessModal;
