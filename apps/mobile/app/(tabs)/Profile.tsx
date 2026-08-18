import { Text, View } from 'react-native';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{user ? user.name : 'No user'}</Text>
      <Text>{user?.email}</Text>
    </View>
  );
}
