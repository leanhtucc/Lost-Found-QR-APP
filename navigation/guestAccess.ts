import type { GuestSession } from '@/storage/guestSession';

export type GuestRouteName =
  | 'PublicItemDetails'
  | 'Chat'
  | 'LiveTracking'
  | 'HandoverConfirm'
  | string;

export const canGuestAccessRoute = (
  routeName: GuestRouteName,
  params: Record<string, unknown> | undefined,
  session: GuestSession | null
): boolean => {
  if (routeName === 'PublicItemDetails') return true;
  if (!session) return false;

  if (routeName === 'Chat') {
    return (
      params?.returnSessionId === session.returnSessionId && params?.channelId === session.channelId
    );
  }

  return (
    (routeName === 'LiveTracking' || routeName === 'HandoverConfirm') &&
    params?.returnSessionId === session.returnSessionId
  );
};
