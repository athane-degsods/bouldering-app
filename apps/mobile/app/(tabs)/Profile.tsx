import { StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../../src/store/useAuthStore';
import { Card, Screen } from '../../src/components/ui';
import { colors, space, type } from '../../src/theme';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <Screen>
      <View style={styles.body}>
        <Text style={styles.title}>Profile</Text>
        <Card>
          <Text style={styles.name}>{user?.name ?? 'No user'}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>
          <Text style={styles.note}>Test session - no login. All logs belong to this climber.</Text>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: space.lg,
    gap: space.lg,
  },
  title: {
    fontSize: type.title,
    fontWeight: '700',
    color: colors.ink,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  email: {
    color: colors.muted,
    fontSize: type.body,
    marginBottom: space.md,
  },
  note: {
    color: colors.muted,
    fontSize: type.meta,
    lineHeight: 18,
  },
});
