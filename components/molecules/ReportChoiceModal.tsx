import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { PackageSearch, QrCode, X } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';
import { FONT_FAMILY } from '@constants/fonts';

interface ReportChoiceModalProps {
  visible: boolean;
  onClose: () => void;
  onFoundItem: () => void;
  onLostOwnItem: () => void;
}

interface ChoiceProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  onPress: () => void;
}

const Choice: React.FC<ChoiceProps> = ({ title, description, icon, accent, onPress }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={title}
    onPress={onPress}
    style={({ pressed }) => [
      styles.choice,
      { borderColor: `${accent}52` },
      pressed ? styles.choicePressed : null,
    ]}
  >
    <View style={[styles.iconWrap, { backgroundColor: `${accent}1F` }]}>{icon}</View>
    <Text style={styles.choiceTitle}>{title}</Text>
    <Text style={styles.choiceDescription}>{description}</Text>
  </Pressable>
);

export const ReportChoiceModal: React.FC<ReportChoiceModalProps> = ({
  visible,
  onClose,
  onFoundItem,
  onLostOwnItem,
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={styles.backdrop} onPress={onClose}>
      <Pressable style={styles.modalCard} onPress={event => event.stopPropagation()}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>BÁO ĐỒ</Text>
            <Text style={styles.title}>Bạn muốn báo trường hợp nào?</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đóng"
            onPress={onClose}
            style={styles.closeButton}
          >
            <X size={19} color={FIND_BACK.mutedText} />
          </Pressable>
        </View>

        <View style={styles.choices}>
          <Choice
            title="Đồ tôi nhặt được"
            description="Thêm vật dụng vừa nhặt được và tìm chủ sở hữu."
            icon={<QrCode size={26} color={FIND_BACK.secondary} />}
            accent={FIND_BACK.secondary}
            onPress={onFoundItem}
          />
          <Choice
            title="Đồ của tôi bị mất"
            description="Xem toàn bộ kho đồ và chọn vật dụng bạn vừa làm mất."
            icon={<PackageSearch size={26} color={FIND_BACK.primaryLight} />}
            accent={FIND_BACK.primaryLight}
            onPress={onLostOwnItem}
          />
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: FIND_BACK.borderGlass,
    backgroundColor: FIND_BACK.surface,
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: FIND_BACK.primaryLight,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  title: {
    marginTop: 6,
    color: FIND_BACK.bodyText,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 22,
    lineHeight: 29,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FIND_BACK.surfaceElevated,
  },
  choices: {
    marginTop: 20,
    gap: 12,
  },
  choice: {
    minHeight: 122,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    backgroundColor: FIND_BACK.surfaceMuted,
  },
  choicePressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceTitle: {
    marginTop: 12,
    color: FIND_BACK.bodyText,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 17,
  },
  choiceDescription: {
    marginTop: 5,
    color: FIND_BACK.mutedText,
    fontFamily: FONT_FAMILY.body,
    fontSize: 13,
    lineHeight: 19,
  },
});
