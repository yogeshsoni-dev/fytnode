import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useAuthStore } from '../../../core/state/auth.store';

export function OnboardingScreen() {
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: '#0B1220' }}>
      <Text style={{ color: 'white', fontSize: 24 }}>Welcome to FytNodes</Text>
      <Pressable onPress={completeOnboarding} style={{ backgroundColor: '#2563EB', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}>
        <Text style={{ color: 'white' }}>Continue</Text>
      </Pressable>
    </View>
  );
}
