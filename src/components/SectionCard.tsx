import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from './GlassCard';
import { WaveformIndicator } from './WaveformIndicator';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type SectionType = 'email' | 'newsletter' | 'headlines' | 'interests' | 'calendar' | 'markets';

interface SectionCardProps {
  title: string;
  sectionType: SectionType;
  isActive?: boolean;
  children: React.ReactNode;
}

const SECTION_TINTS: Record<SectionType, readonly [string, string]> = {
  email: colors.emailGradient,
  newsletter: colors.newsletterGradient,
  headlines: colors.headlinesGradient,
  interests: colors.interestsGradient,
  calendar: ['rgba(0, 150, 200, 0.25)', 'rgba(0, 80, 120, 0.15)'] as const,
  markets: ['rgba(30, 160, 120, 0.25)', 'rgba(20, 100, 80, 0.15)'] as const,
};

export function SectionCard({ title, sectionType, isActive = false, children }: SectionCardProps) {
  const gradient = SECTION_TINTS[sectionType];

  return (
    <View style={styles.container}>
      <GlassCard gradient={gradient} style={styles.card}>
        <View style={styles.header}>
          <WaveformIndicator isActive={isActive} size={20} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.content}>{children}</View>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    padding: 20,
    borderRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginLeft: 12,
    opacity: 0.9,
  },
  content: {
    gap: 12,
  },
});
