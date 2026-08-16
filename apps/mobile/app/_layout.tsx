import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../constants/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.chalk },
          headerTintColor: colors.wall,
          headerTitleStyle: { fontWeight: '800' },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="problem/[id]" options={{ title: 'Problem' }} />
        <Stack.Screen name="problem/upload" options={{ title: 'Upload', presentation: 'modal' }} />
        <Stack.Screen name="gear/add" options={{ title: 'Add Gear', presentation: 'modal' }} />
      </Stack>
    </>
  );
}
