/**
 * Mobile Runtime Smoke Test (Node, no device)
 * Calls the REAL mobile service functions against the running local backend (http://127.0.0.1:3001):
 * scan -> guest-init -> getSession -> propose -> accept -> arrival -> init handover -> confirm handover.
 * Proves that mobile request serialization and response parsing match the backend contract with 0 errors.
 */

import { ENV } from '@/constants/environment';
import { authStorage } from '@/storage/auth';
import { guestSessionStorage, GuestSession } from '@/storage/guestSession';
import { authApi } from '@/services/auth/api';
import { itemsApi } from '@/services/items/api';
import { returnApi } from '@/services/returns/api';
import { resetApiClientStateForTests } from '@/services/http/apiClient';

describe('Mobile Runtime Smoke Test — End-to-End Service Flow', () => {
  let ownerAccessToken: string;
  let ownerRefreshToken: string;
  let qrCodeId: string;
  let returnSessionId: string;
  let guestSessionData: GuestSession;

  beforeAll(async () => {
    // Point mobile environment to the running local backend
    (ENV as any).API_URL = 'http://127.0.0.1:3001';
    await authStorage.clearAll();
    await guestSessionStorage.clear();
    resetApiClientStateForTests();
  });

  afterAll(async () => {
    await authStorage.clearAll();
    await guestSessionStorage.clear();
    resetApiClientStateForTests();
  });

  it('Step 1: Authenticates owner with real login endpoint', async () => {
    const loginRes = await authApi.login({
      email: 'owner_smoke@test.findback.app',
      password: 'Password123!',
    });

    expect(loginRes.success).toBe(true);
    expect(loginRes.data).toBeDefined();

    const token = await authStorage.getAccessToken();
    const refresh = await authStorage.getRefreshToken();
    expect(token).toBeTruthy();
    expect(refresh).toBeTruthy();

    ownerAccessToken = token!;
    ownerRefreshToken = refresh!;
  });

  it('Step 2: Owner creates an item and sets its status to LOST', async () => {
    // Owner token is in authStorage
    const created = await itemsApi.createItem({
      name: 'Chùm chìa khóa chung cư Landmark',
      category: 'keys',
      description: 'Có móc khóa hình gấu nâu',
      imagePublicUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509',
    });

    expect(created).toBeDefined();
    expect(created.id).toBeTruthy();
    expect(created.status).toBe('SAFE');

    qrCodeId = (created.qrCodeId || created.itemId || created.id) as string;
    expect(qrCodeId).toBeTruthy();

    const lostItem = await itemsApi.updateStatus(created.id, {
      status: 'LOST',
      lostMessage: 'Làm rơi ở sảnh thang máy sáng nay',
      latitude: 10.795,
      longitude: 106.721,
    });

    expect(lostItem.status).toBe('LOST');
  });

  it('Step 3: Anonymous Finder scans public item detail (no auth header)', async () => {
    // Simulate anonymous finder: clear tokens
    await authStorage.clearAll();
    await guestSessionStorage.clear();

    const publicItem = await itemsApi.getPublicItem(qrCodeId);
    expect(publicItem).toBeDefined();
    expect(publicItem.name).toBe('Chùm chìa khóa chung cư Landmark');
    expect(publicItem.status).toBe('LOST');
  });

  it('Step 4: Finder initiates guest scan session (guest-init)', async () => {
    const initRes = await itemsApi.initGuestScanSession({
      itemId: qrCodeId,
      phoneNumber: '0988776655',
      lat: 10.795,
      lng: 106.721,
    });

    expect(initRes).toBeDefined();
    expect(initRes.guestAccessToken).toBeTruthy();
    expect(initRes.returnSessionId).toBeTruthy();
    expect(initRes.chatToken).toBeTruthy();

    returnSessionId = initRes.returnSessionId;

    guestSessionData = {
      guestId: initRes.guestInfo?.id || 'guest_finder_user',
      returnSessionId: initRes.returnSessionId,
      channelId: initRes.channelId || `item-${qrCodeId}`,
      guestAccessToken: initRes.guestAccessToken,
      expiresAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
      chatToken: initRes.chatToken,
    };

    await guestSessionStorage.save(guestSessionData);
  });

  it('Step 5: Finder reads session via getSession using guest token attach rule', async () => {
    // authStorage is empty, guestSessionStorage has guestSessionData
    const session = await returnApi.getSession(returnSessionId);

    expect(session).toBeDefined();
    expect(session.id).toBe(returnSessionId);
    expect(session.status).toBe('CHAT_ACTIVE');
  });

  it('Step 6: Finder proposes meetup location and time', async () => {
    const meetupProposed = await returnApi.proposeMeetup(returnSessionId, {
      address: '208 Nguyễn Hữu Cảnh, P. 22, Bình Thạnh',
      name: 'Vincom Mega Mall Landmark 81',
      latitude: 10.795,
      longitude: 106.721,
      scheduledTime: new Date(Date.now() + 3600 * 1000).toISOString(),
      notes: 'Gặp nhau tại Highland Coffee tầng 1',
    });

    expect(meetupProposed).toBeDefined();
    expect(meetupProposed.status).toBe('MEETUP_PROPOSED');
  });

  it('Step 7: Owner accepts proposed meetup', async () => {
    // Switch to Owner context
    await guestSessionStorage.clear();
    await authStorage.saveTokens(ownerAccessToken, ownerRefreshToken);

    const meetupAccepted = await returnApi.acceptMeetup(returnSessionId);

    expect(meetupAccepted).toBeDefined();
    expect(meetupAccepted.status).toBe('MEETUP_ACCEPTED');
  });

  it('Step 8: Both parties notify arrival at meetup location', async () => {
    // Owner notifies arrival
    const ownerArrival = await returnApi.notifyArrival(returnSessionId);
    expect(ownerArrival).toBeDefined();

    // Switch to Finder
    await authStorage.clearAll();
    await guestSessionStorage.save(guestSessionData);

    const finderArrival = await returnApi.notifyArrival(returnSessionId);
    expect(finderArrival).toBeDefined();
  });

  let handoverPin: string;

  it('Step 9: Finder initializes physical handover and receives 6-digit PIN', async () => {
    // Finder context
    const initResult = await returnApi.initHandover(returnSessionId);

    expect(initResult).toBeDefined();
    expect(initResult.code).toMatch(/^\d{6}$/);
    expect(initResult.finderConfirmed).toBe(true);

    handoverPin = initResult.code;
  });

  it('Step 10: Owner confirms handover with PIN, atomically resolving item & session', async () => {
    // Switch to Owner context
    await guestSessionStorage.clear();
    await authStorage.saveTokens(ownerAccessToken, ownerRefreshToken);

    const confirmedSession = await returnApi.confirmHandover(returnSessionId, {
      code: handoverPin,
    });

    expect(confirmedSession).toBeDefined();
    expect(confirmedSession.status).toBe('RESOLVED');

    // Verify item is now marked RESOLVED in public view
    const resolvedItem = await itemsApi.getPublicItem(qrCodeId);
    expect(resolvedItem.status).toBe('RESOLVED');
  });
});
