import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect, useRouter } from 'expo-router';
import { fetchAscents, type Ascent } from '../../src/api/client';

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ClimbCard({ item, onPress }: { item: Ascent; onPress: () => void }) {
  const attemptsLabel = item.attempts === 1 ? '1 attempt' : `${item.attempts} attempts`;
  const statusLabel = item.completed ? 'SEND' : 'project';

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardRow}>
        <Text style={styles.routeName}>{item.routeName}</Text>
        <Text>{item.grade}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.meta}>
          {attemptsLabel}  ·  {statusLabel}
        </Text>
        <Text style={styles.meta}>{formatDate(item.createdAt)}</Text>
      </View>
      {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
    </Pressable>
  );
}

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
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My sends</Text>
          <Text style={styles.meta}>
            {climbs.length} {climbWord}  ·  {sendCount} {sendWord}
          </Text>
        </View>
        <Pressable style={styles.addBtn} onPress={() => router.push('/ascent/new')}>
          <Text>+ Log</Text>
        </Pressable>
      </View>

      {isLoading ? <ActivityIndicator style={styles.centerPad} /> : null}
      {isError ? <Text style={styles.centerPad}>Could not load climbs.</Text> : null}

      {!isLoading && !isError ? (
        <FlatList
          data={climbs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={climbs.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No climbs yet</Text>}
          renderItem={({ item }) => (
            <ClimbCard item={item} onPress={() => router.push(`/ascent/${item.id}`)} />
          )}
        />
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
    marginBottom: 4,
  },
  meta: {
    color: '#444',
  },
  addBtn: {
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  empty: {
    color: '#444',
  },
  centerPad: {
    marginTop: 24,
    textAlign: 'center',
  },
  card: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 12,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeName: {
    flex: 1,
    marginRight: 8,
    fontWeight: '600',
  },
  notes: {
    marginTop: 4,
    color: '#444',
  },
});
