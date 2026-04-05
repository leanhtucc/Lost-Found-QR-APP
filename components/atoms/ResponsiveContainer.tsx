import React, { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

interface ResponsiveContainerProps extends ViewProps {
  /** Nội dung sẽ được bọc bởi container */
  children: ReactNode;
  /** Tùy chọn thêm className để mở rộng */
  className?: string;
  /** Phân loại layout: "form" (căn giữa độ rộng trên tablet) | "row" (chuyển sang ngang trên tablet) */
  variant?: 'form' | 'row';
}

/**
 * ResponsiveContainer
 *
 * Phiên bản "form" (Mặc định):
 * - Giới hạn max-width trên các màn hình lớn, căn giữa (mx-auto).
 * - Luôn giữ dạng Flex Column (dọc), không bao giờ vỡ form chữ.
 *
 * Phiên bản "row":
 * - Trên thiết bị di động (sm và dưới) hiển thị dạng `flex-col`.
 * - Trên tablet và máy tính bảng (md trở lên) chuyển sang `flex-row`.
 *
 * Breakpoints: sm (380px), md (480px), lg (768px), xl (1024px)
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  variant = 'form',
  ...props
}) => {
  const baseClasses = 'flex w-full';

  const formClasses = 'flex-col sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto';

  const rowClasses =
    'flex-col md:flex-row md:justify-between md:items-start lg:max-w-[720px] xl:max-w-[960px] mx-auto gap-4';

  const variantClasses = variant === 'row' ? rowClasses : formClasses;

  return (
    <View className={`${baseClasses} ${variantClasses} ${className ?? ''}`} {...props}>
      {children}
    </View>
  );
};

export default ResponsiveContainer;
