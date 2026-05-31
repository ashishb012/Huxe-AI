import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useDatabaseContext } from '../../src/contexts/DatabaseContext';
import { getMockDailyBrief } from '../../src/mocks/briefData';
import { SectionCard } from '../../src/components/SectionCard';
import { ExpandableCard } from '../../src/components/ExpandableCard';
import { GlassCard } from '../../src/components/GlassCard';
import { WaveformIndicator } from '../../src/components/WaveformIndicator';
import { PlayerBar } from '../../src/components/PlayerBar';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export default function PlayerScreen() {
  const router = useRouter();
  const { userPreferences } = useDatabaseContext();
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [progress, setProgress] = useState(0.3);

  const userName = userPreferences?.preferredName || 'User';
  const brief = getMockDailyBrief(userName);

  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const allCardIds = React.useMemo(() => [
    ...brief.emails.map(e => e.id),
    ...brief.newsletters.map(n => n.id),
    ...brief.headlines.map(h => h.id),
    ...brief.interests.map(i => i.id)
  ], [brief]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveCardId((current) => {
          if (!current) return allCardIds[0];
          const currentIndex = allCardIds.indexOf(current);
          if (currentIndex < allCardIds.length - 1) {
            return allCardIds[currentIndex + 1];
          }
          return null; // Collapse all when done
        });
      }, 4000); // 4 seconds per topic for demo purposes
    }
    return () => clearInterval(interval);
  }, [isPlaying, allCardIds]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Brief</Text>
          <TouchableOpacity onPress={() => router.push('/(main)/settings')} style={styles.headerButton}>
            <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting Card */}
          <View style={styles.greetingContainer}>
            <LinearGradient
              colors={['#8B4513', '#D2691E', '#CD853F', '#F4A460', '#2F4F4F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.greetingGradient}
            />
            <View style={styles.greetingOverlay}>
              <View style={styles.waveformWrapper}>
                <WaveformIndicator isActive={isPlaying} />
              </View>
              <Text style={styles.greetingText}>{brief.greeting}</Text>
              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={16} color={colors.textPrimary} style={{ marginRight: 8 }} />
                <Text style={styles.dateText}>{brief.date}</Text>
              </View>
            </View>
          </View>

          {/* Email Section */}
          <SectionCard title="Email" sectionType="email" isActive={false}>
            {brief.emails.map((email) => (
              <ExpandableCard
                key={email.id}
                title={email.subject}
                subtitle={`From: ${email.from}`}
                icon={<Ionicons name="mail-outline" size={18} color={colors.textPrimary} />}
                isExpanded={activeCardId === email.id}
              >
                <Text style={styles.expandedText}>• {email.snippet}</Text>
              </ExpandableCard>
            ))}
          </SectionCard>

          {/* Newsletter Section */}
          <SectionCard title="Newsletter" sectionType="newsletter" isActive={false}>
            {brief.newsletters.map((nl) => (
              <ExpandableCard
                key={nl.id}
                title={nl.author}
                subtitle={nl.title}
                icon={<Ionicons name="newspaper-outline" size={18} color={colors.textPrimary} />}
                isExpanded={activeCardId === nl.id}
              >
                {nl.bullets.map((bullet, i) => (
                  <Text key={i} style={styles.expandedText}>• {bullet}</Text>
                ))}
              </ExpandableCard>
            ))}
          </SectionCard>

          {/* Headlines Section */}
          <SectionCard title="Headlines" sectionType="headlines" isActive={false}>
            {brief.headlines.map((hl) => (
              <ExpandableCard
                key={hl.id}
                title={hl.source}
                subtitle={hl.title}
                icon={<Ionicons name="newspaper-outline" size={18} color={colors.textPrimary} />}
                isExpanded={activeCardId === hl.id}
              >
                <Text style={styles.expandedText}>• Tap to read the full article on {hl.source}</Text>
              </ExpandableCard>
            ))}
          </SectionCard>

          {/* Interests Section */}
          <SectionCard title="Interests" sectionType="interests" isActive={false}>
            {brief.interests.map((interest) => (
              <ExpandableCard
                key={interest.id}
                title={interest.topic}
                icon={<Ionicons name="radio-button-on" size={12} color={colors.textMuted} />}
                isExpanded={activeCardId === interest.id}
              >
                {interest.bullets.map((bullet, i) => (
                  <Text key={i} style={styles.expandedText}>• {bullet}</Text>
                ))}
              </ExpandableCard>
            ))}
          </SectionCard>

          {/* Farewell Card */}
          <View style={styles.greetingContainer}>
            <LinearGradient
              colors={['#2F4F4F', '#8B4513', '#D2691E', '#CD853F', '#F4A460']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.greetingGradient}
            />
            <View style={styles.greetingOverlay}>
              <View style={styles.waveformWrapper}>
                <WaveformIndicator isActive={false} />
              </View>
              <Text style={styles.greetingText}>Thanks for listening, {userName}</Text>
              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={16} color={colors.textPrimary} style={{ marginRight: 8 }} />
                <Text style={styles.dateText}>{brief.date}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Fixed Player Bar */}
      <PlayerBar
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onSpeedChange={setPlaybackSpeed}
        progress={progress}
      />
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
    paddingVertical: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  backIcon: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  settingsIcon: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  headerTitle: {
    ...typography.bodyBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120, // Space for PlayerBar
    paddingTop: 16,
  },
  greetingContainer: {
    height: 380,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  greetingGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  greetingOverlay: {
    flex: 1,
    padding: 32,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  waveformWrapper: {
    alignSelf: 'flex-start',
  },
  greetingText: {
    ...typography.hero,
    fontSize: 42,
    color: colors.textPrimary,
    lineHeight: 52,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  dateText: {
    ...typography.h3,
    fontSize: 20,
    color: colors.textPrimary,
    opacity: 0.9,
  },
  emailIcon: {
    fontSize: 16,
    color: colors.textPrimary,
    opacity: 0.8,
  },
  bulletIcon: {
    fontSize: 12,
    color: colors.textMuted,
  },
  expandedText: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  jumpContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  jumpButton: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 999,
  },
  jumpText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  headlineCard: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  headlineThumbPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headlineThumbIcon: {
    fontSize: 24,
  },
  headlineTextContainer: {
    flex: 1,
  },
  headlineTitle: {
    ...typography.bodyBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
});
