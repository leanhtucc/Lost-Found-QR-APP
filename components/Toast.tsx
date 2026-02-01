/**
 * Toast Component
 * Hiển thị thông báo dạng toast với animation đẹp
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CheckCircle, XCircle, AlertCircle, X, Info, LucideIcon } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onHide?: () => void;
}

interface ToastProps extends ToastConfig {
  visible: boolean;
  onClose: () => void;
}

const ICONS: Record<ToastType, LucideIcon> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: '#22c55e',
    text: 'text-green-800',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: '#ef4444',
    text: 'text-red-800',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: '#f59e0b',
    text: 'text-amber-800',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: '#3b82f6',
    text: 'text-blue-800',
  },
};

export const Toast: React.FC<ToastProps> = ({
  visible,
  type,
  title,
  message,
  duration = 3000,
  onClose,
  onHide,
}) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const Icon = ICONS[type];
  const colors = COLORS[type];

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const hideToast = () => {
    translateY.value = withTiming(-100, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(handleHideComplete)();
    });
  };

  const handleHideComplete = () => {
    onClose();
    onHide?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={animatedStyle}
      className={`absolute top-12 left-4 right-4 z-50 ${colors.bg} border ${colors.border} rounded-2xl p-4 shadow-lg`}
    >
      <View className="flex-row items-start gap-3">
        {/* Icon */}
        <View className="mt-0.5">
          <Icon size={24} color={colors.icon} />
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className={`font-semibold text-base ${colors.text}`}>{title}</Text>
          {message && <Text className={`text-sm ${colors.text} opacity-80 mt-1`}>{message}</Text>}
        </View>

        {/* Close button */}
        <TouchableOpacity
          onPress={hideToast}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="p-1"
        >
          <X size={18} color={colors.icon} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default Toast;
