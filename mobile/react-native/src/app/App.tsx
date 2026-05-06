import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProviders } from './providers';
import { RootNavigator } from './navigation/RootNavigator';

export function AppRoot() {
  return (
    <SafeAreaProvider>
      <AppProviders>
        <StatusBar barStyle="light-content" />
        <RootNavigator />
      </AppProviders>
    </SafeAreaProvider>
  );
}
