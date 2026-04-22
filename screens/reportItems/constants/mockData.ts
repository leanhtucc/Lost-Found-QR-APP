import { ReportItemOption, ReportLocation, RewardOption } from '../types';

export const REPORT_ITEMS: ReportItemOption[] = [
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    category: 'Điện thoại',
    subtitle: 'Màu Titan Đen - 256GB',
    imageUrl: 'https://www.figma.com/api/mcp/asset/f4717617-8414-4f5d-a3c4-c9a3af163d07',
    serialNumber: '48A9...XL0',
    insured: true,
  },
  {
    id: 'keys',
    name: 'Chìa khóa xe',
    category: 'Phụ kiện',
    subtitle: 'Smart key + chìa cơ',
    imageUrl: 'https://www.figma.com/api/mcp/asset/4bb43e20-b4ab-4c99-9998-48cc7bbcfc71',
    serialNumber: 'K3Y...A21',
    insured: false,
  },
  {
    id: 'wallet',
    name: 'Ví tiền',
    category: 'Vật dụng cá nhân',
    subtitle: 'Ví da nâu, chứa giấy tờ',
    imageUrl: 'https://www.figma.com/api/mcp/asset/bcc27dd8-9d20-4eb2-9a00-66c6069fab34',
    serialNumber: 'W4L...992',
    insured: false,
  },
];

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
];
