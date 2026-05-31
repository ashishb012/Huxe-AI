import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDatabaseContext } from '../../../src/contexts/DatabaseContext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { GlassCard } from '../../../src/components/GlassCard';
import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';

export default function AccountScreen() {
  const router = useRouter();
  const { userPreferences, updateUserPreferences, clearAllData } = useDatabaseContext();
  const { user, signOut } = useAuth();
  
  const [preferredName, setPreferredName] = useState(userPreferences?.preferredName || '');

  useEffect(() => {
    if (userPreferences?.preferredName) {
      setPreferredName(userPreferences.preferredName);
    }
  }, [userPreferences?.preferredName]);

  const handleSaveName = () => {
    if (preferredName.trim()) {
      updateUserPreferences({ preferredName: preferredName.trim() });
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear Local Data",
      "This will reset all preferences, interests, and cached audio. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear Data", 
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            Alert.alert("Success", "All local data has been cleared.");
          }
        }
      ]
    );
  };

  const handleSignOut = async () => {
    await signOut();
    // Router will automatically redirect to login via _layout.tsx auth gate
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account</Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Profile</Text>
          
          <View style={styles.profileHeader}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
            </View>
            <Text style={styles.emailText}>{user?.email || 'email@example.com'}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Preferred Name (for greetings)</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={preferredName}
                onChangeText={setPreferredName}
                placeholder="How should we call you?"
                placeholderTextColor={colors.textMuted}
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveName}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 32, marginBottom: 16 }}>
            <Ionicons name="warning-outline" size={20} color={colors.warning} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Data Management</Text>
          </View>
          
          <GlassCard style={styles.dangerCard}>
            <View style={styles.dangerInfo}>
              <Text style={styles.dangerTitle}>Clear Local Data</Text>
              <Text style={styles.dangerDesc}>
                This will reset all preferences, interests, and cached audio.
              </Text>
            </View>
            <TouchableOpacity style={styles.clearButton} onPress={handleClearData}>
              <Text style={styles.clearButtonText}>Clear Data</Text>
            </TouchableOpacity>
          </GlassCard>

          <View style={styles.accountSection}>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.devSettingsLink}
            onPress={() => Alert.alert("Coming Soon", "Developer settings will be available in Phase 2.")}
          >
            <Text style={styles.devSettingsText}>Developer Settings</Text>
          </TouchableOpacity>
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.accent,
    marginBottom: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  emailText: {
    ...typography.body,
    color: colors.textMuted,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 52,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: colors.textPrimary,
    ...typography.body,
  },
  saveButton: {
    marginLeft: 12,
    height: 52,
    paddingHorizontal: 20,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    ...typography.bodyBold,
    color: colors.accent,
  },
  dangerCard: {
    padding: 20,
    marginBottom: 40,
  },
  dangerInfo: {
    marginBottom: 16,
  },
  dangerTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  dangerDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  clearButton: {
    paddingVertical: 12,
    backgroundColor: 'rgba(239, 83, 80, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 83, 80, 0.3)',
    alignItems: 'center',
  },
  clearButtonText: {
    ...typography.bodyBold,
    color: colors.error,
  },
  accountSection: {
    marginTop: 20,
  },
  signOutButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutButtonText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  devSettingsLink: {
    marginTop: 40,
    alignItems: 'center',
    padding: 16,
  },
  devSettingsText: {
    ...typography.caption,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
