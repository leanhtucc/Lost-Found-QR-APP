import type { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import type { RootStackParamList } from './index';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'lostfoundqr://', 'lostfound://', 'lostfoundapp://'],
  config: {
    screens: {
      ResetPassword: {
        path: 'reset-password',
        parse: { token: (token: string) => token },
      },
      // Legacy item links are public because they may be opened by a finder.
      PublicItemDetails: {
        path: 'item/:itemId',
        alias: ['public-item/:itemId'],
      },
      Login: 'login',
      AuthRegister: 'register',
      ForgotPassword: 'forgot-password',
    },
  },
};
