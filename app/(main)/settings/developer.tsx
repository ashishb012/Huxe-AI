import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';
import { GradientButton } from '../../../src/components/GradientButton';
import { clearAllData } from '../../../src/database/db';
import { clearAudioCache } from '../../../src/services/audioFileService';

export default function DeveloperSettingsScreen() {
  const router = useRouter();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearDatabase = () => {
    Alert.alert(
      'Clear Database',
      'This will delete all history, cached scripts, and reset preferences. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Data', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsClearing(true);
              await clearAllData();
              await clearAudioCache();
              Alert.alert('Success', 'Database and cache cleared.');
              router.replace('/(main)');
            } catch (e) {
              Alert.alert('Error', 'Failed to clear data.');
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons 
          name="arrow-back" 
          size={28} 
          color={colors.textPrimary} 
          onPress={() => router.back()}
        />
        <Text style={styles.headerTitle}>Developer Settings</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="construct-outline" size={20} color={colors.accent} />
            <Text style={styles.sectionTitle}>Tools</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Clear Local Database & Cache</Text>
            <Text style={styles.cardDesc}>
              Removes all generated briefs, cached audio, and restores default settings.
            </Text>
            <View style={{ marginTop: 16 }}>
              <GradientButton 
                title={isClearing ? "Clearing..." : "Reset App Data"} 
                onPress={handleClearDatabase} 
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={colors.accent} />
            <Text style={styles.sectionTitle}>App Info</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.infoRow}>Version: 1.0.0 (Expo SDK 56)</Text>
            <Text style={styles.infoRow}>Environment: Development</Text>
            <Text style={styles.infoRow}>Audio Engine: TrackPlayer</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: 24,
    gap: 32,
    paddingBottom: 40,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  cardTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cardDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  infoRow: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
});
