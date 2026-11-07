export const isValidGuestPhoneNumber = (phoneNumber: string): boolean =>
  /^\+?\d{8,15}$/.test(phoneNumber.replace(/[\s().-]/g, ''));

export interface OwnerItemTarget {
  name: 'ItemDetails';
  params: { itemId: string };
}

export const getOwnerItemTarget = (item: { id?: string } | null): OwnerItemTarget | null =>
  item?.id ? { name: 'ItemDetails', params: { itemId: item.id } } : null;

export const getPublicItemStatusMessage = (status: string | undefined): string => {
  switch ((status || '').toUpperCase()) {
    case 'SAFE':
      return 'Chủ nhân đã đánh dấu món đồ là an toàn.';
    case 'FOUND':
    case 'CLAIMED':
    case 'RETURNING':
      return 'Món đồ đã có người tìm thấy và đang được xử lý trả lại.';
    case 'RESOLVED':
    case 'COMPLETED':
      return 'Việc trả lại món đồ đã hoàn tất.';
    default:
      return 'Món đồ này hiện không còn trong danh sách đang tìm.';
  }
};
