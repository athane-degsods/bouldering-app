import { ScrollView, StyleSheet } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { AscentForm } from '../../src/components/AscentForm';
import { createAscent } from '../../src/api/client';
import { colors } from '../../src/theme';

export default function NewAscentScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: createAscent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ascents'], refetchType: 'all' });
      router.back();
    },
  });

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <AscentForm
        submitLabel="Save"
        busy={create.isPending}
        error={create.isError ? 'Could not save.' : undefined}
        onSubmit={(body) => create.mutate(body)}
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
