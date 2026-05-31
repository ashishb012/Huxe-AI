import { Stack } from 'expo-router';
import { colors } from '../../../src/theme/colors';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="integrations" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="language" />
      <Stack.Screen name="account" />
    </Stack>
  );
}
