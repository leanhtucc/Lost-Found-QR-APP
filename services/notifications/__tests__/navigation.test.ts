import { parseFcmNotificationData, resolveNotificationDestination } from '../navigation';

describe('notification navigation', () => {
  it('parses stringified FCM metadata', () => {
    expect(
      parseFcmNotificationData({
        type: 'MEETUP_PROPOSED',
        metadata: JSON.stringify({ return_session_id: 'session-1' }),
      })
    ).toMatchObject({ type: 'MEETUP_PROPOSED', return_session_id: 'session-1' });
  });

  it('routes return notifications to the current return flow', () => {
    expect(
      resolveNotificationDestination('MEETUP_ACCEPTED', {
        return_session_id: 'session-2',
      })
    ).toEqual({ screen: 'LiveTracking', params: { returnSessionId: 'session-2' } });
  });

  it('routes completed handovers to reward status', () => {
    expect(
      resolveNotificationDestination('HANDOVER_CONFIRMED', {
        return_session_id: 'session-3',
      })
    ).toEqual({ screen: 'RewardStatus', params: { returnSessionId: 'session-3' } });
  });

  it('falls back safely when an entity id is missing', () => {
    expect(resolveNotificationDestination('FOUND_REPORT_CLAIM_ACCEPTED')).toEqual({
      screen: 'Notifications',
    });
  });
});
