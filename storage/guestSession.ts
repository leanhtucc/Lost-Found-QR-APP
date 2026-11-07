import * as SecureStore from 'expo-secure-store';
import { guestSessionEvents } from '@/lib/guestSessionEvents';
export interface GuestSession {
  guestId: string;
  returnSessionId: string;
  channelId: string;
  guestAccessToken: string;
  expiresAt: string;
  chatToken: string;
}
const GUEST_SESSION_KEY = 'guest_return_session_v1';
export const guestSessionStorage = {
  async get(): Promise<GuestSession | null> {
    try {
      const stored = await SecureStore.getItemAsync(GUEST_SESSION_KEY);
      if (!stored) return null;
      const session = JSON.parse(stored) as Partial<GuestSession>;
      if (
        !session.guestId ||
        !session.returnSessionId ||
        !session.channelId ||
        !session.guestAccessToken ||
        !session.expiresAt ||
        !session.chatToken
      ) {
        await this.clear();
        return null;
      }
      return session as GuestSession;
    } catch (error) {
      console.error('Unable to read guest session:', error);
      return null;
    }
  },
  async save(session: GuestSession): Promise<void> {
    await SecureStore.setItemAsync(GUEST_SESSION_KEY, JSON.stringify(session));
    guestSessionEvents.emitChanged();
  },
  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(GUEST_SESSION_KEY);
    guestSessionEvents.emitChanged();
  },
};
export const isTerminalReturnStatus = (status: string | undefined): boolean =>
  Boolean(
    status &&
    [
      'COMPLETED',
      'CANCELLED',
      'EXPIRED',
      'MEETUP_CANCELLED',
      'TRACKING_EXPIRED',
      'HANDOVER_DISPUTED',
      'REFUND_PENDING',
      'PAYOUT_FAILED',
    ].includes(status.toUpperCase())
  );
