import '../global.css';
import 'expo-dev-client';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeToggle } from '~/components/ThemeToggle';
import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/theme';
import React, { Suspense, useEffect } from 'react';
import { View } from 'react-native';

import { SQLiteProvider, openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '~/drizzle/migrations';
import { seedDatabase } from '~/db/seed';
import LottieView from 'lottie-react-native';

export const DATABASE_NAME = 'ledger';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  useInitialAndroidBarSync();
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  const expoDb = openDatabaseSync(DATABASE_NAME);
  const db = drizzle(expoDb);
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (success && !error) {
      seedDatabase(db);
    } else if (error) {
      console.error('Migration failed:', error);
    }
  }, [success, error, db]);

  return (
    <>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'dark' : 'dark'}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <ActionSheetProvider>
            <Suspense
              fallback={
                <View className="flex-1 items-center justify-center">
                  <LottieView
                    autoPlay
                    style={{ width: 300, height: 400 }}
                    source={require('~/assets/lotties/loading.json')}
                  />
                </View>
              }>
              <SQLiteProvider
                databaseName={DATABASE_NAME}
                options={{ enableChangeListener: true }}
                useSuspense>
                <Stack screenOptions={SCREEN_OPTIONS}>
                  <Stack.Screen name="index" options={{ headerTitleAlign: 'center' }} />
                </Stack>
              </SQLiteProvider>
            </Suspense>
          </ActionSheetProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </>
  );
}

const SCREEN_OPTIONS = {
  animation: 'ios_from_right', // for android
} as const;
