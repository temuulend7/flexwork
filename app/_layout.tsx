import { Stack } from 'expo-router';
import '../lib/i18n';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="job-detail" />
      <Stack.Screen name="chat-room" />
      <Stack.Screen name="map" />
      <Stack.Screen name="saved" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="user-profile" />
      <Stack.Screen name="stats" />
    </Stack>
  );
}