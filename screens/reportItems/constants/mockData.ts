import { ReportLocation, RewardOption } from '../types';

export const REPORT_LOCATION: ReportLocation = {
  title: '54 Nguyễn Chí Thanh, Đống Đa',
  subtitle: 'Vị trí hiện tại của ghim',
  cityLine: 'Hà Nội, Việt Nam',
  lat: 21.028512,
  lng: 105.842037,
  address: '54 Nguyễn Chí Thanh, Láng Thượng, Đống Đa, Hà Nội, Việt Nam',
};

export const MAP_PREVIEW_IMAGE =
  'https://www.figma.com/api/mcp/asset/a916713b-6d9b-45ff-b076-be1371b2f144';

export const REWARD_OPTIONS: RewardOption[] = [
  { id: 'basic', label: 'Cơ bản', amount: 50000 },
  { id: 'recommended', label: 'Khuyên dùng', amount: 100000, recommended: true },
  { id: 'effort', label: 'Nỗ lực', amount: 200000 },
  { id: 'premium', label: 'Hậu hĩnh', amount: 500000 },
  { id: 'custom', label: 'Tùy chỉnh', amount: 100000, isCustom: true },
];
