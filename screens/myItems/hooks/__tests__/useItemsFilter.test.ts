import type { Item } from '@/types/item';
import { filterItems, getItemStatusCounts } from '../useItemsFilter';

const createItem = (id: string, name: string, status: Item['status']): Item => ({
  id,
  itemId: `public-${id}`,
  ownerId: 'owner-1',
  name,
  category: 'other',
  status,
  createdAt: '2026-09-26T00:00:00.000Z',
  updatedAt: '2026-09-26T00:00:00.000Z',
});

describe('My Items filtering', () => {
  const items = [
    createItem('internal-safe', 'Ví an toàn', 'SAFE'),
    createItem('internal-lost', 'Điện thoại thất lạc', 'LOST'),
    createItem('internal-found', 'Chìa khóa đã tìm thấy', 'FOUND'),
    createItem('internal-resolved', 'Balo đã hoàn trả', 'RESOLVED'),
  ];

  it('counts only real SAFE and LOST item statuses', () => {
    expect(getItemStatusCounts(items)).toEqual({ safeCount: 1, lostCount: 1 });
  });

  it('does not expose internal ids through search behavior', () => {
    expect(
      filterItems({
        items,
        searchQuery: 'internal-lost',
        categoryFilter: 'all',
        statusFilter: 'all',
      })
    ).toEqual([]);
  });

  it('keeps FOUND and RESOLVED visible in the default list', () => {
    const result = filterItems({
      items,
      searchQuery: '',
      categoryFilter: 'all',
      statusFilter: 'all',
    });

    expect(result.map(item => item.status)).toEqual(['SAFE', 'LOST', 'FOUND', 'RESOLVED']);
  });
});
