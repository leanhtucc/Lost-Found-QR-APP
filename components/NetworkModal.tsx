import { Button } from '@/components/Button';
import SvgWifi from '@/components/icons/Wifi';
import { CustomText as Text } from '@/components/ui/CustomText';
import colors from '@/constants/colors';
import fonts from '@/constants/fonts';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, View } from 'react-native';

interface NetworkModalProps {
  visible: boolean;
  onRetry: () => void;
}

const NetworkModal = ({ visible, onRetry }: NetworkModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent={true} animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <SvgWifi width={42} height={42} />
          </View>

          <Text style={styles.title}>{t('network.title', 'Mất kết nối')}</Text>

          <Text style={styles.message}>
            {t('network.message', 'Không có kết nối Internet.\nVui lòng kiểm tra và thử lại.')}
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              style={styles.retryButton}
              title={t('common.retry', 'Thử lại')}
              onPress={onRetry}
              variant="primary"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#FFF1E8',
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.fontSFProDisplaySemibold,
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '500',
    color: '#000',
  },
  message: {
    fontFamily: fonts.fontSFProDisplayRegular,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
  },
  retryButton: {
    width: '100%',
  },
});

export default NetworkModal;
