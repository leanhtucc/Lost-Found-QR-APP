import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const INSTALLATION_DEVICE_ID_KEY = 'installation_device_id';

export const deviceStorage = {
  async getDeviceId(): Promise<string | null> {
    return SecureStore.getItemAsync(INSTALLATION_DEVICE_ID_KEY);
  },

  async getOrCreateDeviceId(): Promise<string> {
    const existing = await this.getDeviceId();
    if (existing) return existing;

    const created = `${Platform.OS}-${Crypto.randomUUID()}`;
    await SecureStore.setItemAsync(INSTALLATION_DEVICE_ID_KEY, created);
    return created;
  },
};

export default deviceStorage;
