/**
 * Tab layout (`app/(tabs)/_layout.tsx`) — the inner frame (the bottom bar).
 *
 * The folder name `(tabs)` is a group: it does not show up in the URL.
 * `name` must match the file: `index.tsx` → `index` (this is `/`).
 * `_layout` files are never URLs — do not open `/_layout.tsx` in the browser.
 */
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerTitleAlign: 'center' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="Logbook"
        options={{
          title: 'Logbook',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
