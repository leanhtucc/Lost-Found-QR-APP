import { QrCode, Search, Bell, Shield } from 'lucide-react-native';

export interface SlideData {
  id: string;
  icon: typeof QrCode;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

export const slides: SlideData[] = [
  {
    id: '1',
    icon: QrCode,
    title: 'Đăng ký đồ vật',
    description: 'Tạo mã QR độc nhất cho mỗi đồ vật của bạn. Dễ dàng quản lý và theo dõi.',
    color: '#2563EB',
    bgColor: '#DBEAFE',
  },
  {
    id: '2',
    icon: Search,
    title: 'Tìm lại đồ thất lạc',
    description: 'Người nhặt được quét mã QR và liên hệ với bạn ngay lập tức.',
    color: '#059669',
    bgColor: '#D1FAE5',
  },
  {
    id: '3',
    icon: Bell,
    title: 'Thông báo tức thì',
    description: 'Nhận thông báo ngay khi có ai đó tìm thấy đồ vật của bạn.',
    color: '#D97706',
    bgColor: '#FEF3C7',
  },
  {
    id: '4',
    icon: Shield,
    title: 'An toàn & Bảo mật',
    description: 'Thông tin cá nhân được bảo vệ. Bạn kiểm soát những gì được chia sẻ.',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
  },
];
