import { authStorage } from '../auth';

describe('Auth Storage (Logic & Security Test)', () => {
  beforeEach(async () => {
    await authStorage.clearAll();
  });

  it('should save and retrieve access and refresh tokens securely', async () => {
    await authStorage.saveTokens('mock_access_token_123', 'mock_refresh_token_456');

    const accessToken = await authStorage.getAccessToken();
    const refreshToken = await authStorage.getRefreshToken();

    expect(accessToken).toBe('mock_access_token_123');
    expect(refreshToken).toBe('mock_refresh_token_456');
  });

  it('should save and retrieve user profile data', async () => {
    const mockUser = {
      id: 'usr_001',
      uid: 'firebase_uid_123',
      memberId: 'mem_123',
      email: 'test@example.com',
      displayName: 'Lê Tú',
      phoneNumber: '0987654321',
      trustScore: 85,
      isVerified: true,
      totalReturned: 3,
      createdAt: '2026-09-01T00:00:00Z',
    };

    await authStorage.saveUser(mockUser as any);
    const retrievedUser = await authStorage.getUser();

    expect(retrievedUser).toEqual(mockUser);
  });

  it('should clear all auth tokens and user data upon logout', async () => {
    await authStorage.saveTokens('token_to_clear', 'refresh_to_clear');
    await authStorage.saveUser({ id: 'usr_002', email: 'logout@test.com' } as any);

    await authStorage.clearAll();

    const accessToken = await authStorage.getAccessToken();
    const refreshToken = await authStorage.getRefreshToken();
    const user = await authStorage.getUser();

    expect(accessToken).toBeNull();
    expect(refreshToken).toBeNull();
    expect(user).toBeNull();
  });
});
