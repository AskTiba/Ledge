// app.config.js

import { ExpoConfig } from '@expo/config';

// Define environment variables
const APP_VARIANT = process.env.APP_VARIANT || 'production'; // Fallback to 'production' if undefined
const IS_DEV = APP_VARIANT === 'development';
const IS_PREVIEW = APP_VARIANT === 'preview';
const IS_PRODUCTION = process.env.NODE_ENV === 'production'; // Ensure NODE_ENV is set properly

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return 'com.asktiba.Ledge.dev';
  }
  if (IS_PREVIEW) {
    return 'com.asktiba.Ledge.preview';
  }
  return 'com.asktiba.Ledge.production';
};
const getAppName = () => {
  if (IS_DEV) {
    return 'Ledge (Dev)';
  }
  if (IS_PREVIEW) {
    return 'Ledge';
  }
  return 'Ledge 1.0.0';
};


export default ({ config }) => ({
  expo: {
    name: getAppName(),
    slug: 'Ledge',
    version: '1.0.0',
    scheme: 'Ledge',
    newArchEnabled: true,
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-dev-launcher',
        {
          launchMode: 'most-recent',
        },
      ],
      'expo-sqlite',
    ],
    experiments: {
      typedRoutes: true,
      tsconfigPaths: true,
    },
    orientation: 'portrait',
    icon: './assets/icons/Dark.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/icons/splash-icon-light.png',
      resizeMode: 'contain',
      backgroundColor: '#F5FFFA',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: getUniqueIdentifier(),
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/icons/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: getUniqueIdentifier(),
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: '5fcc9ab5-7eab-4edb-b713-6e5a47a42af3',
      },
    },
    updates: {
      url: 'https://u.expo.dev/5fcc9ab5-7eab-4edb-b713-6e5a47a42af3',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
  },
});
