/**
 * Root layout (`app/_layout.tsx`) — the outer frame.
 *
 * Expo Router loads this file first. It is not a tab. It wraps every screen:
 *   1. TanStack Query (so any screen can call useQuery)
 *   2. The seeded test user in Zustand (not real login)
 *   3. A Stack: tabs sit on the first card, ascent/[id] can slide on top
 *
 * If the API health check fails, we skip the Stack and show one message.
 */
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { fetchHealth, queryClient } from '../src/api/client';
import { useAuthStore } from '../src/store/useAuthStore';

/** Same row as prisma/seed.ts — hardcoded until GET /api/users/test exists. */
const TEST_USER = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'test@bouldering.app',
  name: 'Test Climber',
};

/**
 * Must live *inside* QueryClientProvider so useQuery works.
 * Providers cannot use the client they themselves create in the same component.
 */
function RootShell() {
  const setUser = useAuthStore((state) => state.setUser);

  // No retry: a down server should become "No connection", not a long spinner.
  const health = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    retry: false,
  });

  // Drop the test climber into Zustand once. Profile (and later screens) read it.
  useEffect(() => {
    setUser(TEST_USER);
  }, [setUser]);

  if (health.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (health.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.offline}>No connection</Text>
        <Text style={styles.hint}>Start the API (`npm run dev:server`) and reload.</Text>
      </View>
    );
  }

  // name="(tabs)" matches the folder. headerShown: false — the tab bar is enough.
  // name="ascent/[id]" matches app/ascent/[id].tsx. Not a tab.
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="ascent/new" options={{ title: 'New log' }} />
      <Stack.Screen name="ascent/[id]" options={{ title: 'Ascent' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootShell />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  offline: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  hint: {
    textAlign: 'center',
    color: '#666',
  },
});
