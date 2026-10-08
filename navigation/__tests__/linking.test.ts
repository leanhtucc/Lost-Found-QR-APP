import { getStateFromPath } from '@react-navigation/native';
import { linking } from '../linking';

describe('item deep links', () => {
  it.each(['item/abc123', 'public-item/abc123'])(
    '%s opens public item details with the item id',
    path => {
      const state = getStateFromPath(path, linking.config);

      expect(state?.routes[0]).toMatchObject({
        name: 'PublicItemDetails',
        params: { itemId: 'abc123' },
      });
    }
  );
});
