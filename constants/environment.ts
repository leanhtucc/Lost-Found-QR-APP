import Constants from 'expo-constants';

// Environment variables configuration
const ENV = {
  dev: {
    apiUrl: 'http://localhost:3000',
    environment: 'development',
  },
  staging: {
    apiUrl: 'https://api-staging.yourapp.com',
    environment: 'staging',
  },
  production: {
    apiUrl: 'https://api.yourapp.com',
    environment: 'production',
  },
};

// Get environment from Constants
const getEnvVars = (env = Constants.expoConfig?.extra?.environment || 'dev') => {
  if (env === 'production') return ENV.production;
  if (env === 'staging') return ENV.staging;
  return ENV.dev;
};

export default getEnvVars();
