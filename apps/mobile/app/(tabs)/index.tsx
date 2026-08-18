import { Text, View } from 'react-native';

/** File must be named `index.tsx` so this screen is `/` (the app start). `Home.tsx` would be `/Home` and `/` would be unmatched. */
export default function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home</Text>
    </View>
  );
}
