import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GlassCard } from '../../../src/components/GlassCard';
import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';

const SETTINGS_PAGES = [
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect your Google accounts',
    icon: <Ionicons name="link-outline" size={20} color={colors.textPrimary} />,
    route: '/(main)/settings/integrations',
  },
  {
    id: 'interests',
    title: 'Interests',
    description: 'Customize your daily brief topics',
    icon: <Ionicons name="bulb-outline" size={20} color={colors.textPrimary} />,
    route: '/(main)/settings/interests',
  },
  {
    id: 'schedule',
    title: 'Daily Schedule',
    description: 'Choose when to generate your brief',
    icon: <Ionicons name="time-outline" size={20} color={colors.textPrimary} />,
    route: '/(main)/settings/schedule',
  },
  {
    id: 'language',
    title: 'Language & Audio',
    description: 'Language and voice preferences',
    icon: <Ionicons name="globe-outline" size={20} color={colors.textPrimary} />,
    route: '/(main)/settings/language',
  },
  {
    id: 'account',
    title: 'Account',
    description: 'Manage your profile and data',
    icon: <Ionicons name="person-outline" size={20} color={colors.textPrimary} />,
    route: '/(main)/settings/account',
  },
  {
    id: 'developer',
    title: 'Developer',
    description: 'Advanced tools and debugging',
    icon: <Ionicons name="construct-outline" size={20} color={colors.textPrimary} />,
    route: '/(main)/settings/developer',
  },
];

export default function SettingsHubScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.cardsContainer}>
            {SETTINGS_PAGES.map((page) => (
              <GlassCard
                key={page.id}
                style={styles.card}
                onPress={() => router.push(page.route as any)}
              >
                <View style={styles.cardContent}>
                  <View style={styles.iconContainer}>
                    {page.icon}
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.title}>{page.title}</Text>
                    <Text style={styles.description}>{page.description}</Text>
                  </View>
                  <View style={styles.chevronContainer}>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.version}>Huxe AI v1.0.0</Text>
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
  cardsContainer: {
    gap: 12,
  },
  card: {
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chevronContainer: {
    width: 24,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: 24,
    color: colors.textMuted,
  },
  footer: {
    marginTop: 48,
    alignItems: 'center',
  },
  version: {
    ...typography.caption,
    color: colors.textMuted,
    opacity: 0.5,
  },
});
