module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@components': './components',
            '@screens': './screens',
            '@navigation': './navigation',
            '@hooks': './hooks',
            '@utils': './utils',
            '@constants': './constants',
            '@services': './services',
            '@store': './store',
            '@types': './types',
            '@firebase': './firebase',
            '@libs': './libs',
            '@storage': './storage',
            '@schemas': './schemas',
            '@translations': './translations',
            '@assets': './assets',
            '@contexts': './contexts',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      ],
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          safe: false,
          allowUndefined: true,
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
