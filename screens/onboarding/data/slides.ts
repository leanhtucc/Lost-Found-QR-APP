// Dữ liệu 3 slide onboarding theo đúng thiết kế Figma
// File .ts thuần — icon được lưu dưới dạng ComponentType để tránh JSX trong .ts
import { ComponentType } from 'react';
import { SvgProps } from 'react-native-svg';
import { ArrowRight, Sparkles, Gift, LucideProps } from 'lucide-react-native';
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
    title: 'Stick. Scan. Safe.',
    description: 'The most reliable way to recover your lost belongings and protect what you love.',
    buttonLabel: 'Protect Your Valuables',
    ButtonIcon: ArrowRight,
    buttonIconProps: { size: 20, color: '#FFFFFF', strokeWidth: 2.5 },
  },
  {
    id: '2',
    IconComponent: IconOnboarding1,
    title: 'Report & let the crowd help',
    description: 'Our community of finders is ready to help you recover your items in no time.',
    buttonLabel: 'Next',
    ButtonIcon: ArrowRight,
    buttonIconProps: { size: 20, color: '#FFFFFF', strokeWidth: 2 },
  },
  {
    id: '3',
    IconComponent: IconOnboarding2,
    title: 'Honest finders earn real rewards',
    description: 'Do the right thing and get recognized. Honesty pays off with real-world rewards.',
    buttonLabel: 'Get Started',
    buttonIconProps: { size: 20, color: '#FFFFFF', strokeWidth: 2 },
  },
];
