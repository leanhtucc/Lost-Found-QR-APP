import * as SecureStore from 'expo-secure-store';
import { guestSessionStorage, isTerminalReturnStatus } from '../guestSession';
const secureStore = SecureStore as jest.Mocked<typeof SecureStore>;
describe('guest session storage', () => {
  const session = {
    guestId: 'guest-1',
    returnSessionId: 'return-1',
    channelId: 'item_qr-1_guest-1',
    guestAccessToken: 'guest-token',
    expiresAt: '2030-01-01T00:00:00.000Z',
    chatToken: 'stream-token',
  };
  beforeEach(async () => {
    jest.clearAllMocks();
    await guestSessionStorage.clear();
  });
  it('stores guest credentials separately from user auth storage', async () => {
    await guestSessionStorage.save(session);
    expect(secureStore.setItemAsync).toHaveBeenCalledWith(
      'guest_return_session_v1',
      JSON.stringify(session)
    );
    expect(await guestSessionStorage.get()).toEqual(session);
  });
  it('clears only the guest session explicitly', async () => {
    await guestSessionStorage.save(session);
    jest.clearAllMocks();
    await guestSessionStorage.clear();
    expect(secureStore.deleteItemAsync).toHaveBeenCalledWith('guest_return_session_v1');
    expect(secureStore.deleteItemAsync).toHaveBeenCalledTimes(1);
  });
  it.each(['COMPLETED', 'CANCELLED', 'EXPIRED', 'MEETUP_CANCELLED', 'TRACKING_EXPIRED'])(
    'recognizes %s as a terminal return state',
    status => {
      expect(isTerminalReturnStatus(status)).toBe(true);
    }
  );
  it('does not treat an active return as terminal', () => {
    expect(isTerminalReturnStatus('CHAT_ACTIVE')).toBe(false);
  });
});
