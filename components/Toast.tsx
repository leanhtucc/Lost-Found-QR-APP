/**
 * Toast Component (Beacon style)
 * Dark card with a coloured accent bar, tinted icon chip, optional action,
 * and a thin progress line showing how long the toast stays.
 */

import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FIND_BACK } from '@constants/theme';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  type: ToastType;
  title: string;
  message?: string;
  /** Milliseconds on screen. Defaults depend on type (errors stay longer). */
  duration?: number;
  /** Optional call to action shown under the message. */
  actionLabel?: string;
  onAction?: () => void;
  onHide?: () => void;
}

interface ToastProps extends ToastConfig {
  visible: boolean;
  onClose: () => void;
}

const ICONS: Record<ToastType, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const ACCENT: Record<ToastType, string> = {
  success: FIND_BACK.secondary,
  error: FIND_BACK.danger,
  warning: FIND_BACK.tertiary,
  info: FIND_BACK.primaryLight,
};

const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 3500,
  info: 4000,
  warning: 5500,
  error: 6000,
};

const ACTION_DURATION = 9000;
const HIDDEN_OFFSET = -140;

export const Toast: React.FC<ToastProps> = ({
  visible,
  type,
  title,
  message,
  duration,
  actionLabel,
  onAction,
  onClose,
  onHide,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(HIDDEN_OFFSET);
  const opacity = useSharedValue(0);
  const progress = useSharedValue(1);

  const Icon = ICONS[type];
  const accent = ACCENT[type];
  const visibleFor = duration ?? (actionLabel ? ACTION_DURATION : DEFAULT_DURATION[type]);

  const handleHideComplete = () => {
    onClose();
    onHide?.();
  };

  const hideToast = () => {
    translateY.value = withTiming(HIDDEN_OFFSET, { duration: 260 });
    opacity.value = withTiming(0, { duration: 260 }, finished => {
      if (finished) runOnJS(handleHideComplete)();
    });
  };

  useEffect(() => {
    if (!visible) return;

    translateY.value = HIDDEN_OFFSET;
    opacity.value = 0;
    progress.value = 1;

    translateY.value = withSpring(0, { damping: 16, stiffness: 170 });
    opacity.value = withTiming(1, { duration: 180 });
    progress.value = withTiming(0, { duration: visibleFor, easing: Easing.linear });

    const timer = setTimeout(hideToast, visibleFor);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, title, message]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, progress.value)) * 100}%`,
  }));

  if (!visible) return null;

  const handleAction = () => {
    onAction?.();
    hideToast();
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        containerStyle,
        { position: 'absolute', top: insets.top + 8, left: 16, right: 16, zIndex: 50 },
      ]}
    >
      <Pressable
        onPress={hideToast}
        accessibilityRole="alert"
        accessibilityLiveRegion={type === 'error' ? 'assertive' : 'polite'}
        accessibilityLabel={message ? `${title}. ${message}` : title}
        style={{
          backgroundColor: FIND_BACK.surfaceElevated,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.10)',
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOpacity: 0.35,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 10,
        }}
      >
        {/* Accent bar */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            backgroundColor: accent,
          }}
        />

        <View
          style={{ flexDirection: 'row', alignItems: 'flex-start', padding: 14, paddingLeft: 18 }}
        >
          {/* Icon chip */}
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${accent}26`,
              marginRight: 12,
            }}
          >
            <Icon size={20} color={accent} />
          </View>

          {/* Text */}
          <View style={{ flex: 1, paddingTop: 1 }}>
            <Text className="text-[15px] font-bold leading-5 text-fb-content">{title}</Text>
            {message ? (
              <Text className="mt-0.5 text-[13px] leading-[18px] text-fb-muted">{message}</Text>
            ) : null}

            {actionLabel ? (
              <Pressable
                onPress={handleAction}
                accessibilityRole="button"
                accessibilityLabel={actionLabel}
                hitSlop={8}
                style={{ minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' }}
              >
                <Text style={{ color: accent, fontSize: 14, fontWeight: '700' }}>
                  {actionLabel}
                </Text>
              </Pressable>
            ) : null}
          </View>

          {/* Close */}
          <Pressable
            onPress={hideToast}
            accessibilityRole="button"
            accessibilityLabel="Đóng thông báo"
            hitSlop={8}
            style={{
              width: 32,
              height: 32,
              marginRight: -6,
              marginTop: -4,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} color={FIND_BACK.mutedText} />
          </Pressable>
        </View>

        {/* Time-left line */}
        <View style={{ height: 3, backgroundColor: 'rgba(255,255,255,0.06)' }}>
          <Animated.View style={[{ height: 3, backgroundColor: accent }, progressStyle]} />
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default Toast;
