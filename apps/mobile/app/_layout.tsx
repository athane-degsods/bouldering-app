import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { fetchHealth, queryClient } from '../src/api/client';
import { useAuthStore } from '../src/store/useAuthStore';
import { colors, space, type } from '../src/theme';

const TEST_USER = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'test@bouldering.app',
  name: 'Test Climber',
};

function RootShell() {
  const setUser = useAuthStore((state) => state.setUser);

  const health = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    retry: false,
  });

  useEffect(() => {
    setUser(TEST_USER);
  }, [setUser]);

  if (health.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
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

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.ink,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700', color: colors.ink },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="ascent/new" options={{ title: 'New log' }} />
      <Stack.Screen name="ascent/[id]" options={{ title: 'Climb' }} />
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
    padding: space.xl,
    backgroundColor: colors.bg,
  },
  offline: {
    fontSize: type.title,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: space.sm,
  },
  hint: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: type.body,
  },
});
