import React, { useMemo, useRef } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { X } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { REPORT_COLORS } from '../constants/theme';

interface PaymentWebViewModalProps {
  visible: boolean;
  paymentUrl: string;
  onClose: () => void;
  onPaymentSuccess: (url: string) => void;
  onPaymentCancel: (url: string) => void;
}

const SUCCESS_PATTERNS = [
  'payment-result',
  'vnpay-return',
  'payment-success',
  'status=success',
  'result=success',
  'vnp_responsecode=00',
  'vnp_transactionstatus=00',
  'success',
];
const CANCEL_PATTERNS = [
  'payment-cancel',
  'vnpay-fail',
  'status=failed',
  'status=cancel',
  'fail',
  'cancel',
];

const containsAnyPattern = (url: string, patterns: string[]): boolean => {
  const normalized = url.toLowerCase();
  return patterns.some(pattern => normalized.includes(pattern));
};

export const PaymentWebViewModal: React.FC<PaymentWebViewModalProps> = ({
  visible,
  paymentUrl,
  onClose,
  onPaymentSuccess,
  onPaymentCancel,
}) => {
  const handledUrlRef = useRef<string | null>(null);

  const canRenderWebView = useMemo(() => {
    return typeof paymentUrl === 'string' && paymentUrl.trim().length > 0;
  }, [paymentUrl]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <View
          style={{
            height: 62,
            backgroundColor: 'rgba(8,8,15,0.96)',
            borderBottomWidth: 1,
            borderBottomColor: REPORT_COLORS.border,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 15, fontWeight: '700' }}>
            Thanh toán Guardian
          </Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.85}>
            <X color={REPORT_COLORS.textPrimary} size={20} />
          </TouchableOpacity>
        </View>

        {canRenderWebView ? (
          <WebView
            source={{ uri: paymentUrl }}
            onNavigationStateChange={state => {
              if (!state.url || handledUrlRef.current === state.url) {
                return;
              }

              if (containsAnyPattern(state.url, SUCCESS_PATTERNS)) {
                handledUrlRef.current = state.url;
                onPaymentSuccess(state.url);
                return;
              }

              if (containsAnyPattern(state.url, CANCEL_PATTERNS)) {
                handledUrlRef.current = state.url;
                onPaymentCancel(state.url);
              }
            }}
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 15, fontWeight: '700' }}>
              Không thể mở trang thanh toán
            </Text>
            <Text
              style={{
                color: REPORT_COLORS.textSecondary,
                fontSize: 14,
                textAlign: 'center',
                marginTop: 10,
              }}
            >
              Link thanh toán không hợp lệ. Vui lòng thử gửi báo mất lại.
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};
