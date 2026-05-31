import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/contexts/AuthContext';
import { GlassCard } from '../../src/components/GlassCard';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn();
    } catch (error) {
      console.error(error);
      setIsSigningIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.backgroundGradient}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={styles.logo}>Huxe AI</Text>
            <Text style={styles.tagline}>Your personal daily brief, powered by AI</Text>
          </View>

          <View style={styles.cardContainer}>
            <GlassCard style={styles.card}>
              <Text style={styles.cardTitle}>Sign in to get started</Text>
              
              <TouchableOpacity 
                style={styles.googleButton} 
                onPress={handleSignIn}
                disabled={isSigningIn || isLoading}
                activeOpacity={0.8}
              >
                {isSigningIn || isLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Text style={styles.googleG}>G</Text>
                    <Text style={styles.googleButtonText}>Sign in with Google</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <Text style={styles.disclaimer}>
                We'll access your Gmail & Calendar (read-only)
              </Text>
            </GlassCard>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>v1.0.0</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 64,
  },
  logo: {
    ...typography.hero,
    fontSize: 56, // Override for logo
    textShadowColor: 'rgba(212, 165, 116, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    marginBottom: 8,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    padding: 24,
    width: '100%',
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  googleButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  googleG: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4285F4',
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: 16,
    alignItems: 'center',
  },
  version: {
    ...typography.caption,
    color: colors.textMuted,
    opacity: 0.5,
  },
});
