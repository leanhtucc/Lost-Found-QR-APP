// Dữ liệu 3 slide onboarding theo đúng thiết kế Figma
// File .ts thuần — icon được lưu dưới dạng ComponentType để tránh JSX trong .ts
import { ComponentType } from 'react';
import { SvgProps } from 'react-native-svg';
import { ArrowRight, LucideProps } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';
import { IconOnboarding, IconOnboarding1, IconOnboarding2 } from '@components/icons';

export interface SlideData {
  id: string;
  /** SVG illustration hiển thị trong slide */
  IconComponent: ComponentType<SvgProps>;
  title: string;
  description: string;
  /** Label nút CTA */
  buttonLabel: string;
  /**
   * Lucide icon component cho nút CTA (rightIcon của Button).
   * Bạn thay bằng bất kỳ ComponentType<LucideProps> nào bạn muốn.
   * Undefined = không hiển thị icon.
   */
  ButtonIcon?: ComponentType<LucideProps>;
  /** Props truyền vào ButtonIcon: size, color, strokeWidth */
  buttonIconProps?: Partial<LucideProps>;
}

export const slides: SlideData[] = [
  {
    id: '1',
    IconComponent: IconOnboarding,
    title: 'Dán mã. Quét nhanh. An tâm.',
    description:
      'Một cách đơn giản và đáng tin cậy để bảo vệ, nhận diện và tìm lại đồ dùng của bạn.',
    buttonLabel: 'Bảo vệ đồ dùng',
    ButtonIcon: ArrowRight,
    buttonIconProps: { size: 20, color: FIND_BACK.bodyText, strokeWidth: 2.5 },
  },
  {
    id: '2',
    IconComponent: IconOnboarding1,
    title: 'Báo mất, cộng đồng hỗ trợ',
    description: 'Kích hoạt radar để những người ở gần có thể cùng bạn tìm lại món đồ nhanh hơn.',
    buttonLabel: 'Tiếp tục',
    ButtonIcon: ArrowRight,
    buttonIconProps: { size: 20, color: FIND_BACK.bodyText, strokeWidth: 2 },
  },
  {
    id: '3',
    IconComponent: IconOnboarding2,
    title: 'Tử tế luôn được ghi nhận',
    description: 'Người tìm thấy đồ được xác minh, ghi nhận uy tín và nhận phần thưởng xứng đáng.',
    buttonLabel: 'Bắt đầu ngay',
    buttonIconProps: { size: 20, color: FIND_BACK.bodyText, strokeWidth: 2 },
  },
];
