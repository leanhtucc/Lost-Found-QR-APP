import React from 'react';
import { AppState, Linking } from 'react-native';
import * as Location from 'expo-location';
import TestRenderer, { act } from 'react-test-renderer';
import { useLiveTracking } from '@/hooks/useLiveTracking';
import { useReturnStore } from '@/services/returns/store';
import { returnApi } from '@/services/returns/api';
import { ParticipantCard } from '@/screens/return-flow/components/ParticipantCard';

jest.mock('@/services/returns/api', () => ({
  returnApi: { getSession: jest.fn(), stopTracking: jest.fn() },
}));
jest.mock('@/services/returns/socket', () => ({ emitReturnLocation: jest.fn() }));

const liveSession = (allowed: boolean) => ({
  id: 'return_1',
  channelId: 'return_return_1',
  sourceType: 'ITEM' as const,
  itemId: 'item_1',
  itemName: 'Ví',
  status: allowed ? ('TRACKING_ACTIVE' as const) : ('MEETUP_CANCELLED' as const),
  owner: { id: 'owner', role: 'OWNER' as const, displayName: 'Owner' },
  finder: { id: 'finder', role: 'FINDER' as const, displayName: 'Finder' },
  serverRevision: 1,
  trackingExpiresAt: allowed ? new Date(Date.now() + 60_000).toISOString() : null,
  capabilities: {
    canReviewMeetup: false,
    directionsAllowed: allowed,
    liveSharingAllowed: allowed,
    handoverAllowed: false,
    canCancel: allowed,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe('Phase 4 live tracking and directions integration', () => {
  let appStateHandler: ((state: string) => void) | undefined;
  const removeWatcher = jest.fn();
  const watchPositionAsync = jest.fn(async () => ({ remove: removeWatcher }));

  beforeEach(() => {
    jest.clearAllMocks();
    useReturnStore.getState().reset();
    Object.defineProperty(Location, 'watchPositionAsync', {
      configurable: true,
      value: watchPositionAsync,
    });
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_, handler: any) => {
      appStateHandler = handler;
      return { remove: jest.fn() } as any;
    });
  });

  const flush = () => new Promise(resolve => setTimeout(resolve, 0));

  it('stops in background, refetches first, and restarts only from fresh capability without duplicate watchers', async () => {
    useReturnStore.setState({ session: liveSession(true) });
    (returnApi.getSession as jest.Mock).mockResolvedValueOnce(liveSession(false));
    const Harness = () => {
      useLiveTracking({
        enabled: true,
        sessionId: 'return_1',
        meetupLatitude: 10,
        meetupLongitude: 106,
      });
      return null;
    };
    let renderer!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(<Harness />);
      await flush();
    });

    expect(watchPositionAsync).toHaveBeenCalledTimes(1);
    act(() => appStateHandler?.('background'));
    expect(removeWatcher).toHaveBeenCalledTimes(1);

    await act(async () => {
      appStateHandler?.('active');
      await flush();
    });
    expect(returnApi.getSession).toHaveBeenCalledWith('return_1');
    expect(watchPositionAsync).toHaveBeenCalledTimes(1);

    (returnApi.getSession as jest.Mock).mockResolvedValueOnce(liveSession(true));
    await act(async () => {
      appStateHandler?.('active');
      await flush();
    });
    expect(watchPositionAsync).toHaveBeenCalledTimes(2);

    await act(async () => {
      appStateHandler?.('active');
      await flush();
    });
    expect(watchPositionAsync).toHaveBeenCalledTimes(2);
    act(() => renderer.unmount());
  });

  it('hides directions before eligibility and opens only the approved meetup coordinates', async () => {
    const baseProps = {
      partner: { id: 'finder', role: 'FINDER' as const, displayName: 'Finder' },
      meetupAddress: 'Approved meetup',
      meetupLatitude: 10.123456,
      meetupLongitude: 106.654321,
      distanceToMeetup: 100,
      etaToMeetup: '2 phút',
      isPartnerStale: false,
      itemName: 'Ví',
      status: 'MEETUP_ACCEPTED' as const,
      isSelfArrived: false,
      isPartnerArrived: false,
      onBackToChat: jest.fn(),
      onNotifyArrival: jest.fn(),
      onGoToHandover: jest.fn(),
    };
    let view!: TestRenderer.ReactTestRenderer;
    act(() => {
      view = TestRenderer.create(<ParticipantCard {...baseProps} directionsAllowed={false} />);
    });
    expect(view.root.findAll(node => node.props.children === 'Chỉ đường')).toHaveLength(0);

    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);
    act(() => view.update(<ParticipantCard {...baseProps} directionsAllowed />));
    const label = view.root.find(node => node.props.children === 'Chỉ đường');
    let button = label.parent;
    while (button && typeof button.props.onPress !== 'function') button = button.parent;
    expect(button).not.toBeNull();
    await act(async () => {
      await button?.props.onPress();
    });
    expect(open).toHaveBeenCalledWith(
      'https://www.google.com/maps/dir/?api=1&destination=10.123456,106.654321'
    );
    expect(open.mock.calls[0][0]).not.toMatch(/key=|capture|lost|finder/i);
  });
});
