import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GlassCard } from '../../../src/components/GlassCard';
import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';
import { useAuth } from '../../../src/contexts/AuthContext';

export default function IntegrationsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Integrations</Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Google Accounts</Text>
          
          <GlassCard style={styles.accountCard}>
            <View style={styles.accountHeader}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{user?.name || 'User'}</Text>
                <Text style={styles.accountEmail}>{user?.email || 'email@example.com'}</Text>
              </View>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>Connected</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <TouchableOpacity style={styles.disconnectButton} onPress={() => signOut()}>
                <Text style={styles.disconnectText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          <View style={styles.addAccountContainer}>
            <TouchableOpacity 
              style={styles.addAccountButton}
              onPress={() => alert('Multi-account support is coming in a future update!')}
            >
              <Text style={styles.addAccountText}>+ Add another Google account</Text>
            </TouchableOpacity>
            <Text style={styles.infoText}>
              We only access your Gmail (read-only) and Calendar (read-only)
            </Text>
          </View>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  spacer: {
    width: 44,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.accent,
    marginBottom: 16,
  },
  accountCard: {
    padding: 20,
    marginBottom: 32,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  accountEmail: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  badgeContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  badgeText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: 'bold',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: 16,
    alignItems: 'center',
  },
  disconnectButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  disconnectText: {
    ...typography.bodyBold,
    color: colors.error,
  },
  addAccountContainer: {
    alignItems: 'center',
  },
  addAccountButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  addAccountText: {
    ...typography.bodyBold,
    color: colors.accent,
  },
  infoText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
