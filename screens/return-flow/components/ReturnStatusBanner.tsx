/**
 * ReturnStatusBanner Component
 * Hiển thị thanh tiến trình 5 chặng cốt lõi: Hẹn gặp -> Di chuyển -> Bàn giao -> Nhận thưởng -> Đánh giá
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Check, MapPin, Navigation, Handshake, DollarSign, Star } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';
import { ReturnSessionStatus } from '@/types/return-flow';

interface ReturnStatusBannerProps {
  status: ReturnSessionStatus;
}

interface StepItem {
  id: number;
  label: string;
  icon: any;
  activeWhen: ReturnSessionStatus[];
  completedWhen: ReturnSessionStatus[];
}

const STEPS: StepItem[] = [
  {
    id: 1,
    label: 'Điểm gặp',
    icon: MapPin,
    activeWhen: ['CHAT_ACTIVE', 'MEETUP_PROPOSED'],
    completedWhen: [
      'MEETUP_ACCEPTED',
      'TRACKING_ACTIVE',
      'ARRIVAL_PENDING',
      'HANDOVER_PENDING',
      'HANDOVER_CONFIRMED',
      'REWARD_RELEASING',
      'REWARD_PAID',
      'RATING_PENDING',
      'COMPLETED',
    ],
  },
  {
    id: 2,
    label: 'Live Map',
    icon: Navigation,
    activeWhen: ['MEETUP_ACCEPTED', 'TRACKING_ACTIVE', 'ARRIVAL_PENDING'],
    completedWhen: [
      'HANDOVER_PENDING',
      'HANDOVER_CONFIRMED',
      'REWARD_RELEASING',
      'REWARD_PAID',
      'RATING_PENDING',
      'COMPLETED',
    ],
  },
  {
    id: 3,
    label: 'Bàn giao',
    icon: Handshake,
    activeWhen: ['HANDOVER_PENDING'],
    completedWhen: [
      'HANDOVER_CONFIRMED',
      'REWARD_RELEASING',
      'REWARD_PAID',
      'RATING_PENDING',
      'COMPLETED',
    ],
  },
  {
    id: 4,
    label: 'Tiền thưởng',
    icon: DollarSign,
    activeWhen: ['HANDOVER_CONFIRMED', 'REWARD_RELEASING', 'REWARD_PAID'],
    completedWhen: ['RATING_PENDING', 'COMPLETED'],
  },
  {
    id: 5,
    label: 'Đánh giá',
    icon: Star,
    activeWhen: ['RATING_PENDING'],
    completedWhen: ['COMPLETED'],
  },
];

export const ReturnStatusBanner: React.FC<ReturnStatusBannerProps> = ({ status }) => {
  return (
    <View className="border-b border-fb-border-subtle bg-fb-surface px-4 py-3">
      <View className="flex-row items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = step.completedWhen.includes(status);
          const isActive = step.activeWhen.includes(status);
          const IconComponent = step.icon;

          return (
            <React.Fragment key={step.id}>
              {/* Step Node */}
              <View className="items-center">
                <View
                  className={`h-8 w-8 items-center justify-center rounded-full border ${
                    isCompleted
                      ? 'border-fb-secondary bg-fb-secondary/20'
                      : isActive
                        ? 'border-fb-primary bg-fb-primary/20'
                        : 'border-fb-border-subtle bg-fb-surface-elevated'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={14} color={FIND_BACK.secondary} />
                  ) : (
                    <IconComponent
                      size={14}
                      color={isActive ? FIND_BACK.primaryLight : FIND_BACK.mutedText}
                    />
                  )}
                </View>
                <Text
                  className={`mt-1 text-[10px] font-medium ${
                    isActive
                      ? 'text-fb-primary-light font-bold'
                      : isCompleted
                        ? 'text-fb-secondary'
                        : 'text-fb-muted'
                  }`}
                >
                  {step.label}
                </Text>
              </View>

              {/* Connecting Line between steps */}
              {index < STEPS.length - 1 && (
                <View
                  className={`h-0.5 flex-1 mx-1.5 -mt-3.5 ${
                    isCompleted ? 'bg-fb-secondary' : 'bg-fb-border-subtle'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};
