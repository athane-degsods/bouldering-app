import { ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AscentForm } from '../../src/components/AscentForm';
import { deleteAscent, fetchAscent, updateAscent } from '../../src/api/client';
import { EmptyState, LoadingBlock, Screen } from '../../src/components/ui';
import { colors } from '../../src/theme';

export default function AscentDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const router = useRouter();
  const queryClient = useQueryClient();

  const ascent = useQuery({
    queryKey: ['ascent', id],
    queryFn: () => fetchAscent(id!),
    enabled: Boolean(id),
  });

  const update = useMutation({
    mutationFn: (body: Parameters<typeof updateAscent>[1]) => updateAscent(id!, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ascents'], refetchType: 'all' });
      await queryClient.invalidateQueries({ queryKey: ['ascent', id] });
      router.back();
    },
  });

  const remove = useMutation({
    mutationFn: () => deleteAscent(id!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ascents'], refetchType: 'all' });
      router.back();
    },
  });

  if (!id) {
    return (
      <Screen>
        <EmptyState title="Missing id." />
      </Screen>
    );
  }

  if (ascent.isLoading) {
    return (
      <Screen>
        <LoadingBlock />
      </Screen>
    );
  }

  if (ascent.isError || !ascent.data) {
    return (
      <Screen>
        <EmptyState title="Could not load this climb." />
      </Screen>
    );
  }

  const busy = update.isPending || remove.isPending;
  const error =
    update.isError || remove.isError ? 'Could not save or delete.' : undefined;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <AscentForm
        initial={ascent.data}
        submitLabel="Save"
        busy={busy}
        error={error}
        onSubmit={(body) => update.mutate(body)}
        onDelete={() => remove.mutate()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingBottom: 40,
  },
});
