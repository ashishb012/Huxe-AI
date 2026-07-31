import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GlassCard } from '../../../src/components/GlassCard';
import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';
import { useAuth } from '../../../src/contexts/AuthContext';

export default function IntegrationsScreen() {
  const router = useRouter();
  const { connectedAccounts, linkGoogleAccount, unlinkGoogleAccount } = useAuth();
  const [isLinking, setIsLinking] = useState(false);

  const addAccount = async () => {
    try {
      setIsLinking(true);
      await linkGoogleAccount();
    } catch (error) {
      Alert.alert('Could not connect account', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsLinking(false);
    }
  };

  const disconnect = (email: string) => {
    Alert.alert('Disconnect account?', `${email} will no longer be included in your podcast.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Disconnect', style: 'destructive', onPress: () => unlinkGoogleAccount(email) },
    ]);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Integrations</Text>
          <View style={styles.spacer} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Google Accounts</Text>
          {connectedAccounts.map(account => (
            <GlassCard style={styles.accountCard} key={account.email}>
              <View style={styles.accountHeader}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{account.name[0] || 'G'}</Text></View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{account.name}</Text>
                  <Text style={styles.accountEmail}>{account.email}</Text>
                </View>
                <Text style={styles.badgeText}>{account.isPrimary ? 'Primary' : 'Connected'}</Text>
              </View>
              {!account.isPrimary && (
                <TouchableOpacity style={styles.disconnectButton} onPress={() => disconnect(account.email)}>
                  <Text style={styles.disconnectText}>Disconnect</Text>
                </TouchableOpacity>
              )}
            </GlassCard>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={addAccount} disabled={isLinking}>
            {isLinking ? <ActivityIndicator color={colors.accent} /> : <Text style={styles.addText}>+ Add another Google account</Text>}
          </TouchableOpacity>
          <Text style={styles.infoText}>We only access Gmail and Calendar with read-only permission. Every connected account is included in your podcast.</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background }, safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 },
  backButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' }, spacer: { width: 44 },
  headerTitle: { ...typography.h2, color: colors.textPrimary }, content: { paddingHorizontal: 24, paddingTop: 24 },
  sectionTitle: { ...typography.h3, color: colors.accent, marginBottom: 16 }, accountCard: { padding: 20, marginBottom: 12 },
  accountHeader: { flexDirection: 'row', alignItems: 'center' }, avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { ...typography.h3, color: colors.textPrimary }, accountInfo: { flex: 1 }, accountName: { ...typography.bodyBold, color: colors.textPrimary },
  accountEmail: { ...typography.caption, color: colors.textSecondary }, badgeText: { ...typography.caption, color: colors.success, fontWeight: 'bold' },
  disconnectButton: { borderTopWidth: 1, borderTopColor: colors.surfaceBorder, marginTop: 16, paddingTop: 14, alignItems: 'center' }, disconnectText: { ...typography.bodyBold, color: colors.error },
  addButton: { height: 52, borderRadius: 26, borderWidth: 1, borderColor: colors.accent, justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 16 },
  addText: { ...typography.bodyBold, color: colors.accent }, infoText: { ...typography.caption, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 20 },
});
