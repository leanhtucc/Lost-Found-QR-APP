import { Linking } from 'react-native';
import { isValidCoordinate, openExternalDirections } from '@/services/maps/directions';
import { useReturnStore } from '@/services/returns/store';
import { returnApi } from '@/services/returns/api';

jest.mock('@/services/returns/api', () => ({
  returnApi: {
    getSession: jest.fn(),
    createOrGetSession: jest.fn(),
    stopTracking: jest.fn(),
  },
}));

describe('Phase 4 Mobile Return Flow Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useReturnStore.getState().reset();
  });

  describe('1. External Google Maps Directions & Coordinate Validation', () => {
    it('validates coordinate boundaries accurately', () => {
      expect(isValidCoordinate(21.0285, 105.8542)).toBe(true);
      expect(isValidCoordinate(-90, 180)).toBe(true);
      expect(isValidCoordinate(90, -180)).toBe(true);
      expect(isValidCoordinate(91, 105)).toBe(false);
      expect(isValidCoordinate(-91, 105)).toBe(false);
      expect(isValidCoordinate(21, 181)).toBe(false);
      expect(isValidCoordinate(21, -181)).toBe(false);
      expect(isValidCoordinate(NaN, 105)).toBe(false);
      expect(isValidCoordinate(21, undefined)).toBe(false);
    });

    it('generates universal Google Maps URL with no API keys', async () => {
      const openSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);

      const result = await openExternalDirections(20.9809, 105.7874);
      expect(result).toBe(true);
      expect(openSpy).toHaveBeenCalledWith(
        'https://www.google.com/maps/dir/?api=1&destination=20.9809,105.7874'
      );
      // Ensure no Google API key is embedded in external URL
      expect(openSpy.mock.calls[0][0]).not.toContain('key=');
      expect(openSpy.mock.calls[0][0]).not.toContain('AIza');
    });

    it('returns false and does not call openURL if coordinates are invalid', async () => {
      const openSpy = jest.spyOn(Linking, 'openURL');
      const result = await openExternalDirections(999, 999);
      expect(result).toBe(false);
      expect(openSpy).not.toHaveBeenCalled();
    });
  });

  describe('2. Fail-Closed Return Store State', () => {
    it('clears ReturnSession state completely on 401, 403, or 404', async () => {
      useReturnStore.setState({
        session: {
          id: 'ret_1',
          channelId: 'return_ret_1',
          sourceType: 'ITEM',
          itemId: 'item_1',
          itemName: 'Test Item',
          owner: { id: 'u1', displayName: 'Owner', role: 'OWNER' },
          finder: { id: 'u2', displayName: 'Finder', role: 'FINDER' },
          status: 'TRACKING_ACTIVE',
          serverRevision: 1,
          capabilities: {
            canReviewMeetup: false,
            directionsAllowed: true,
            liveSharingAllowed: true,
            handoverAllowed: false,
            canCancel: true,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        currentRole: 'OWNER',
      });

      const forbiddenError: any = new Error('Forbidden');
      forbiddenError.status = 403;
      (returnApi.getSession as jest.Mock).mockRejectedValueOnce(forbiddenError);

      await useReturnStore.getState().refreshSession('ret_1');

      const state = useReturnStore.getState();
      expect(state.session).toBeNull();
      expect(state.currentRole).toBeNull();
      expect(state.connectionState).toBe('disconnected');
      expect(state.myLocation).toBeNull();
      expect(state.partnerLocation).toBeNull();
    });

    it('fails closed by stripping capabilities on transient network error', async () => {
      useReturnStore.setState({
        session: {
          id: 'ret_1',
          channelId: 'return_ret_1',
          sourceType: 'ITEM',
          itemId: 'item_1',
          itemName: 'Test Item',
          owner: { id: 'u1', displayName: 'Owner', role: 'OWNER' },
          finder: { id: 'u2', displayName: 'Finder', role: 'FINDER' },
          status: 'TRACKING_ACTIVE',
          serverRevision: 1,
          capabilities: {
            canReviewMeetup: false,
            directionsAllowed: true,
            liveSharingAllowed: true,
            handoverAllowed: false,
            canCancel: true,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        currentRole: 'OWNER',
      });

      const networkError: any = new Error('Gateway Timeout');
      networkError.status = 504;
      (returnApi.getSession as jest.Mock).mockRejectedValueOnce(networkError);

      await useReturnStore.getState().refreshSession('ret_1');

      const state = useReturnStore.getState();
      // Session object is preserved but critical capabilities are disabled
      expect(state.session).not.toBeNull();
      expect(state.session?.capabilities.directionsAllowed).toBe(false);
      expect(state.session?.capabilities.liveSharingAllowed).toBe(false);
      expect(state.session?.capabilities.handoverAllowed).toBe(false);
      expect(state.myLocation).toBeNull();
      expect(state.partnerLocation).toBeNull();
    });
  });
});
