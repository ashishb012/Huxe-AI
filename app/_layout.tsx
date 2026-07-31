import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts as useCaveatFonts, Caveat_400Regular, Caveat_700Bold } from '@expo-google-fonts/caveat';
import { useFonts as usePlayfairFonts, PlayfairDisplay_400Regular } from '@expo-google-fonts/playfair-display';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { DatabaseProvider } from '../src/contexts/DatabaseContext';
import { colors } from '../src/theme/colors';
import TrackPlayer from 'react-native-track-player';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { NetworkStatus } from '../src/components/NetworkStatus';
import Toast from 'react-native-toast-message';
import '../src/services/dailyBriefScheduler';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Register background playback service
TrackPlayer.registerPlaybackService(() => require('../src/services/service'));

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated
      router.replace('/(main)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(main)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [caveatLoaded, caveatError] = useCaveatFonts({
    Caveat_400Regular,
    Caveat_700Bold,
  });
  
  const [playfairLoaded, playfairError] = usePlayfairFonts({
    PlayfairDisplay_400Regular,
  });

  const onLayoutRootView = useCallback(async () => {
    if ((caveatLoaded || caveatError) && (playfairLoaded || playfairError)) {
      await SplashScreen.hideAsync();
    }
  }, [caveatLoaded, caveatError, playfairLoaded, playfairError]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if ((!caveatLoaded && !caveatError) || (!playfairLoaded && !playfairError)) {
    return null;
  }

  return (
    <ErrorBoundary>
      <DatabaseProvider>
        <AuthProvider>
          <NetworkStatus />
          <StatusBar style="light" />
          <RootLayoutNav />
          <Toast />
        </AuthProvider>
      </DatabaseProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
