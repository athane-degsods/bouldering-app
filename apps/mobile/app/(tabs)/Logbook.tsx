import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect, useRouter } from 'expo-router';
import { fetchAscents } from '../../src/api/client';
import {
  ClimbCard,
  EmptyState,
  LoadingBlock,
  PrimaryButton,
  Screen,
} from '../../src/components/ui';
import { colors, space, type } from '../../src/theme';

export default function LogbookScreen() {
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
  const sendCount = climbs.filter((c) => c.completed).length;
  const climbWord = climbs.length === 1 ? 'climb' : 'climbs';
  const sendWord = sendCount === 1 ? 'send' : 'sends';

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Logbook</Text>
          <Text style={styles.meta}>
            {climbs.length} {climbWord} · {sendCount} {sendWord}
          </Text>
        </View>
        <View style={styles.addWrap}>
          <PrimaryButton label="Log climb" onPress={() => router.push('/ascent/new')} />
        </View>
      </View>

      {isLoading ? <LoadingBlock /> : null}
      {isError ? (
        <EmptyState title="Could not load climbs." hint="Check that the API is running." />
      ) : null}

      {!isLoading && !isError ? (
        <FlatList
          data={climbs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={climbs.length === 0 ? styles.emptyList : styles.list}
          ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
          ListEmptyComponent={
            <EmptyState title="No climbs yet" hint="Tap Log climb to add your first problem." />
          }
          renderItem={({ item }) => (
            <ClimbCard item={item} onPress={() => router.push(`/ascent/${item.id}`)} />
          )}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.md,
    gap: space.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: type.title,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  meta: {
    color: colors.muted,
    fontSize: type.meta,
  },
  addWrap: {
    minWidth: 120,
  },
  list: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xl,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: space.lg,
  },
});
