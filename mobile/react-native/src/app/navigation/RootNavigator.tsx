import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppTabs } from './TabsNavigator';
import { AuthStack } from './AuthNavigator';
import { OnboardingScreen } from '../../features/onboarding/screens/OnboardingScreen';
import { useAuthStore } from '../../core/state/auth.store';

type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  App: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);
  const accessToken = useAuthStore((s) => s.accessToken);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : accessToken ? (
          <Stack.Screen name="App" component={AppTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
