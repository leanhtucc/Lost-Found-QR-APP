import { isGuestRouteAllowed } from '../guestRoute';
describe('guest route allowlist', () => {
  it('allows only the bound return session and finder-side actions', () => {
    expect(isGuestRouteAllowed('/api/v1/returns/return-1', 'GET', 'return-1')).toBe(true);
    expect(isGuestRouteAllowed('/v1/returns/return-1/meetup/propose', 'POST', 'return-1')).toBe(
      true
    );
    expect(isGuestRouteAllowed('/api/returns/return-2/meetup/propose', 'POST', 'return-1')).toBe(
      false
    );
  });
  it.each([
    ['/api/items/item-1', 'GET'],
    ['/api/stream/token', 'POST'],
    ['/api/returns', 'POST'],
    ['/api/v1/returns/return-1/rating', 'POST'],
    ['/api/v1/returns/return-1/handover/confirm', 'POST'],
    ['/api/v1/returns/return-1/handover/dispute', 'POST'],
  ])('rejects guest credentials for %s', (url, method) => {
    expect(isGuestRouteAllowed(url, method, 'return-1')).toBe(false);
  });
  it.each(['/api/guest/refresh', '/api/guest/stream-token'])(
    'allows guest credential endpoints %s',
    url => {
      expect(isGuestRouteAllowed(url, 'POST')).toBe(true);
    }
  );
});
