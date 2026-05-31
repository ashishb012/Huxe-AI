import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDatabaseContext } from '../../../src/contexts/DatabaseContext';
import { GEMINI_VOICES } from '../../../src/database/schema';
import { GlassCard } from '../../../src/components/GlassCard';
import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';

export default function LanguageScreen() {
  const router = useRouter();
  const { userPreferences, updateUserPreferences } = useDatabaseContext();

  const handleLanguageChange = (language: 'en' | 'kn') => {
    updateUserPreferences({ language });
  };

  const handleVoiceChange = (type: 'voice1' | 'voice2', voice: string) => {
    updateUserPreferences({ [type]: voice });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Language & Audio</Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Language</Text>
          
          <GlassCard style={styles.card}>
            <TouchableOpacity 
              style={styles.radioRow} 
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={styles.radioText}>English</Text>
              {userPreferences?.language === 'en' && <Ionicons name="checkmark" size={20} color={colors.accent} />}
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.radioRow} 
              onPress={() => handleLanguageChange('kn')}
            >
              <Text style={styles.radioText}>ಕನ್ನಡ (Kannada)</Text>
              {userPreferences?.language === 'kn' && <Ionicons name="checkmark" size={20} color={colors.accent} />}
            </TouchableOpacity>
          </GlassCard>

          <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Voice Selection</Text>
          
          <Text style={styles.label}>Agent 1 (Host)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.voiceScroll}>
            {GEMINI_VOICES.map((voice) => (
              <TouchableOpacity
                key={`v1-${voice}`}
                style={[
                  styles.voicePill,
                  userPreferences?.voice1 === voice && styles.voicePillSelected
                ]}
                onPress={() => handleVoiceChange('voice1', voice)}
              >
                <Text style={[
                  styles.voiceText,
                  userPreferences?.voice1 === voice && styles.voiceTextSelected
                ]}>{voice}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.label, { marginTop: 24 }]}>Agent 2 (Co-host)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.voiceScroll}>
            {GEMINI_VOICES.map((voice) => (
              <TouchableOpacity
                key={`v2-${voice}`}
                style={[
                  styles.voicePill,
                  userPreferences?.voice2 === voice && styles.voicePillSelected
                ]}
                onPress={() => handleVoiceChange('voice2', voice)}
              >
                <Text style={[
                  styles.voiceText,
                  userPreferences?.voice2 === voice && styles.voiceTextSelected
                ]}>{voice}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.previewContainer}>
            <Text style={styles.previewText}>
              Voice preview will be available after connecting your Gemini API key
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.accent,
    marginBottom: 16,
  },
  card: {
    padding: 8,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  radioText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  checkIcon: {
    fontSize: 18,
    color: colors.accent,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginHorizontal: 12,
  },
  label: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  voiceScroll: {
    paddingRight: 24,
    gap: 8,
  },
  voicePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  voicePillSelected: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.accent,
  },
  voiceText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  voiceTextSelected: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  previewContainer: {
    marginTop: 48,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  previewText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
