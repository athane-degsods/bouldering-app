import { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect, useRouter } from 'expo-router';
import { fetchAscents, type Ascent } from '../../src/api/client';
import { useAuthStore } from '../../src/store/useAuthStore';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function isThisWeek(iso: string) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) {
    return false;
  }
  return Date.now() - t <= WEEK_MS;
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.meta}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['ascents'],
    queryFn: fetchAscents,
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const climbs = data ?? [];
  const logged = climbs.length;
  const sends = climbs.filter((c) => c.completed).length;
  const sendRate = logged === 0 ? 0 : Math.round((sends / logged) * 100);
  const thisWeek = climbs.filter((c) => isThisWeek(c.createdAt)).length;
  const recent = [...climbs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>This week</Text>
        <Pressable style={styles.userBtn} onPress={() => router.push('/Profile')}>
          <Text>{user?.name ?? 'User'}</Text>
        </Pressable>
      </View>

      {isLoading ? <ActivityIndicator style={styles.centerPad} /> : null}
      {isError ? <Text style={styles.centerPad}>Could not load climbs.</Text> : null}

      {!isLoading && !isError ? (
        <View style={styles.body}>
          <View style={styles.statsRow}>
            <StatBox label="Logged" value={String(logged)} />
            <StatBox label="Send rate" value={`${sendRate}%`} />
            <StatBox label="This week" value={String(thisWeek)} />
          </View>

          <Text style={styles.recentLabel}>Recent (2 most recent ascents)</Text>
          {recent.length === 0 ? (
            <Text style={styles.meta}>No climbs yet</Text>
          ) : (
            recent.map((item: Ascent) => (
              <Pressable
                key={item.id}
                style={styles.row}
                onPress={() => router.push(`/ascent/${item.id}`)}
              >
                <Text>
                  {item.routeName}  ·  {item.grade}  ·  {item.completed ? 'SEND' : 'project'}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 18,
  },
  userBtn: {
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  body: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  stat: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
  },
  statValue: {
    fontSize: 22,
    marginTop: 6,
  },
  recentLabel: {
    marginBottom: 8,
  },
  row: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 12,
    marginBottom: 8,
  },
  meta: {
    color: '#444',
  },
  centerPad: {
    marginTop: 24,
    textAlign: 'center',
  },
});
