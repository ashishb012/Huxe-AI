import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, Modal, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/contexts/AuthContext';
import { GlassCard } from '../../src/components/GlassCard';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const INVITE_CODE = process.env.EXPO_PUBLIC_INVITE_CODE || '';

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleGoogleButtonPress = () => {
    setInviteCode('');
    setShowInviteModal(true);
  };

  const handleInviteSubmit = async () => {
    if (inviteCode.trim().toUpperCase() !== INVITE_CODE.toUpperCase()) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Invite Code',
        text2: 'Please enter a valid invite code to continue.',
        position: 'bottom',
        visibilityTime: 3000,
      });
      return;
    }

    // Code matched — close modal and proceed with Google sign-in
    setShowInviteModal(false);
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
                onPress={handleGoogleButtonPress}
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

      {/* Invite Code Modal */}
      <Modal
        visible={showInviteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInviteModal(false)}
        onShow={() => setTimeout(() => inputRef.current?.focus(), 100)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowInviteModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Enter Invite Code</Text>
            <Text style={styles.modalSubtitle}>
              Huxe AI is currently invite-only. Please enter your code to continue.
            </Text>

            <TextInput
              ref={inputRef}
              style={styles.modalInput}
              placeholder="Invite code"
              placeholderTextColor={colors.textMuted}
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={handleInviteSubmit}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowInviteModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handleInviteSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.modalSubmitText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(30, 25, 20, 0.95)',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 14,
  },
  modalInput: {
    width: '100%',
    height: 50,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 4,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  modalSubmitButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.accent,
  },
  modalSubmitText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
});
