import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect, useRouter } from 'expo-router';
import { fetchAscents } from '../../src/api/client';
import { ClimbCard, EmptyState, LoadingBlock, Screen } from '../../src/components/ui';
import { colors, radius, space, type } from '../../src/theme';

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
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
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
    <Screen>
      <View style={styles.header}>
        <Text style={styles.kicker}>Boulder Logs</Text>
        <Text style={styles.title}>This week</Text>
      </View>

      {isLoading ? <LoadingBlock /> : null}
      {isError ? (
        <EmptyState title="Could not load climbs." hint="Check that the API is running." />
      ) : null}

      {!isLoading && !isError ? (
        <View style={styles.body}>
          <View style={styles.statsRow}>
            <StatBox label="Logged" value={String(logged)} />
            <StatBox label="Send rate" value={`${sendRate}%`} />
            <StatBox label="This week" value={String(thisWeek)} />
          </View>

          <Text style={styles.section}>Recent</Text>
          {recent.length === 0 ? (
            <EmptyState
              title="No climbs yet"
              hint="Open Logbook and tap Log climb to start a diary."
            />
          ) : (
            <View style={styles.recentList}>
              {recent.map((item) => (
                <ClimbCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/ascent/${item.id}`)}
                />
              ))}
            </View>
          )}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.md,
  },
  kicker: {
    color: colors.muted,
    fontSize: type.meta,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: space.xs,
  },
  title: {
    fontSize: type.title,
    fontWeight: '700',
    color: colors.ink,
  },
  body: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: space.sm,
    marginBottom: space.xl,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
  },
  statLabel: {
    color: colors.muted,
    fontSize: type.meta,
  },
  statValue: {
    fontSize: type.stat,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 6,
  },
  section: {
    fontSize: type.section,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: space.md,
  },
  recentList: {
    gap: space.md,
  },
});
