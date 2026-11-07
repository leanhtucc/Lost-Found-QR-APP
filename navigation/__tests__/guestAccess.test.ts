import { canGuestAccessRoute } from '../guestAccess';
import type { GuestSession } from '@/storage/guestSession';

const guestSession: GuestSession = {
  guestId: 'guest-1',
  returnSessionId: 'return-1',
  channelId: 'channel-1',
  guestAccessToken: 'guest-token',
  expiresAt: '2099-01-01T00:00:00.000Z',
  chatToken: 'chat-token',
};

describe('guest navigation access', () => {
  it('allows chat only with the guest channel and bound return session', () => {
    expect(
      canGuestAccessRoute(
        'Chat',
        {
          channelId: 'channel-1',
          returnSessionId: 'return-1',
        },
        guestSession
      )
    ).toBe(true);
    expect(
      canGuestAccessRoute(
        'Chat',
        {
          channelId: 'channel-other',
          returnSessionId: 'return-1',
        },
        guestSession
      )
    ).toBe(false);
  });

  it('allows live tracking and handover only for the bound session', () => {
    expect(canGuestAccessRoute('LiveTracking', { returnSessionId: 'return-1' }, guestSession)).toBe(
      true
    );
    expect(
      canGuestAccessRoute('HandoverConfirm', { returnSessionId: 'return-2' }, guestSession)
    ).toBe(false);
  });

  it('keeps rating and owner routes protected while allowing public item details', () => {
    expect(canGuestAccessRoute('RateFinder', { returnSessionId: 'return-1' }, guestSession)).toBe(
      false
    );
    expect(canGuestAccessRoute('ItemDetails', { itemId: 'item-1' }, guestSession)).toBe(false);
    expect(canGuestAccessRoute('PublicItemDetails', { itemId: 'qr-1' }, null)).toBe(true);
  });
});
