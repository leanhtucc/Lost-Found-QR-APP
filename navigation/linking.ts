import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './index';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'lostfoundqr://',
    'lostfound://',
    'lostfoundapp://',
    'https://lostfound.app',
    'https://www.lostfound.app',
    'https://app.lostfound.vn',
    'https://www.app.lostfound.vn',
    'https://findback.vn',
    'https://www.findback.vn',
  ],
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
