import { Stack } from 'expo-router';
import { colors } from '../../src/theme/colors';

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="player" 
        options={{
          animation: 'slide_from_bottom',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="settings" 
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}
