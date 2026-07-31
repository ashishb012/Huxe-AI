import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import { useProgress, useIsPlaying } from 'react-native-track-player';

import { useDatabaseContext } from '../../src/contexts/DatabaseContext';
import { getBriefHistoryById, getScriptForHistory } from '../../src/database/db';
import { DailyBriefData } from '../../src/types/brief';
import { PodcastScript } from '../../src/services/scriptService';
import { loadTracks, play, pause, seekBy, seekTo, setPlaybackRate } from '../../src/services/playerService';
import { GeneratedTrack } from '../../src/services/ttsService';

import { SectionCard } from '../../src/components/SectionCard';
import { ExpandableCard } from '../../src/components/ExpandableCard';
import { WaveformIndicator } from '../../src/components/WaveformIndicator';
import { PlayerBar } from '../../src/components/PlayerBar';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export default function PlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const historyId = params.id ? parseInt(params.id as string) : null;

  const { userPreferences } = useDatabaseContext();
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  
  const [brief, setBrief] = useState<DailyBriefData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // TrackPlayer Hooks
  const { playing } = useIsPlaying();
  const progressState = useProgress();

  const userName = userPreferences?.preferredName || 'User';

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        if (historyId) {
          const history = await getBriefHistoryById(historyId);
          if (history && history.briefDataJson) {
            setBrief(JSON.parse(history.briefDataJson));
          }
          
          const scriptRecord = await getScriptForHistory(historyId);
          if (scriptRecord) {
            const parsedScript: PodcastScript = JSON.parse(scriptRecord.scriptJson);
            // Always load as a single track — no automatic jumping between topics
            const tracks: GeneratedTrack[] = [{
              id: `full_podcast`,
              url: `${FileSystem.documentDirectory}audio_cache/brief_${historyId}_part_0.wav`,
              title: parsedScript.title || 'Daily Brief',
              artist: 'Huxe AI',
              duration: 0
            }];
            
            await loadTracks(tracks);
            await play();
          }
        }
      } catch (error) {
        console.error('Failed to load brief data from DB:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();

    return () => {
      // Pause when leaving — wrapped in try/catch because TrackPlayer
      // may not be initialized if the user navigates away early
      void pause().catch(() => undefined);
    };
  }, [historyId]);

  const handleTogglePlay = () => {
    if (playing) {
      void pause().catch((error) => console.warn('[Player] Pause unavailable:', error));
    } else {
      void play().catch((error) => console.warn('[Player] Play unavailable:', error));
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    void setPlaybackRate(speed).catch((error) => console.warn('[Player] Playback rate unavailable:', error));
  };

  const handleSeek = (position: number) => {
    void seekTo(Math.min(Math.max(position, 0), progressState.duration || position)).catch((error) =>
      console.warn('[Player] Seek unavailable:', error),
    );
  };

  const handleSeekBy = (seconds: number) => {
    void seekBy(seconds).catch((error) => console.warn('[Player] Seek unavailable:', error));
  };

  if (isLoading || !brief) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ ...typography.body, color: colors.textSecondary, marginTop: 16 }}>
            Generating your brief...
          </Text>
        </SafeAreaView>
      </View>
    );
  }

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
                <WaveformIndicator isActive={playing || false} />
              </View>
              <Text style={styles.greetingText}>{brief.greeting}</Text>
              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={16} color={colors.textPrimary} style={{ marginRight: 8 }} />
                <Text style={styles.dateText}>{brief.date}</Text>
              </View>
            </View>
          </View>

          {/* Calendar Section */}
          {brief.calendar.length > 0 && (
            <SectionCard title="Calendar" sectionType="calendar" isActive={false}>
              {brief.calendar.map((event) => (
                <ExpandableCard
                  key={event.id}
                  title={event.title}
                  subtitle={`${event.time}${event.accountEmail ? ` · ${event.accountEmail}` : ''}`}
                  icon={<Ionicons name="calendar-outline" size={18} color={colors.textPrimary} />}
                >
                  {event.location && <Text style={styles.expandedText}>• Location: {event.location}</Text>}
                </ExpandableCard>
              ))}
            </SectionCard>
          )}

          {/* Email Section */}
          {brief.emails.length > 0 && (
            <SectionCard title="Email" sectionType="email" isActive={false}>
              {brief.emails.map((email) => (
                <ExpandableCard
                  key={email.id}
                  title={email.subject}
                  subtitle={`From: ${email.from}${email.accountEmail ? ` · ${email.accountEmail}` : ''}`}
                  icon={<Ionicons name="mail-outline" size={18} color={colors.textPrimary} />}
                >
                  <Text style={styles.expandedText}>• {email.snippet}</Text>
                </ExpandableCard>
              ))}
            </SectionCard>
          )}

          {/* Newsletter Section */}
          {brief.newsletters.length > 0 && (
            <SectionCard title="Newsletter" sectionType="newsletter" isActive={false}>
              {brief.newsletters.map((nl) => (
                <ExpandableCard
                  key={nl.id}
                  title={nl.author}
                  subtitle={`${nl.title}${nl.accountEmail ? ` · ${nl.accountEmail}` : ''}`}
                  icon={<Ionicons name="newspaper-outline" size={18} color={colors.textPrimary} />}
                >
                  {nl.bullets.map((bullet, i) => (
                    <Text key={i} style={styles.expandedText}>• {bullet}</Text>
                  ))}
                </ExpandableCard>
              ))}
            </SectionCard>
          )}

          {/* Headlines Section */}
          {brief.headlines.length > 0 && (
            <SectionCard title="Headlines" sectionType="headlines" isActive={false}>
              {brief.headlines.map((hl) => (
                <ExpandableCard
                  key={hl.id}
                  title={hl.source}
                  subtitle={hl.title}
                  icon={<Ionicons name="newspaper-outline" size={18} color={colors.textPrimary} />}
                >
                  <Text style={styles.expandedText}>• Tap to read the full article on {hl.source}</Text>
                </ExpandableCard>
              ))}
            </SectionCard>
          )}

          {/* Interests Section */}
          {brief.interests.length > 0 && (
            <SectionCard title="Interests" sectionType="interests" isActive={false}>
              {brief.interests.map((interest) => (
                <ExpandableCard
                  key={interest.id}
                  title={interest.topic}
                  icon={<Ionicons name="radio-button-on" size={12} color={colors.textMuted} />}
                >
                  {interest.bullets.map((bullet, i) => (
                    <Text key={i} style={styles.expandedText}>• {bullet}</Text>
                  ))}
                </ExpandableCard>
              ))}
            </SectionCard>
          )}

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
        isPlaying={playing || false}
        playbackSpeed={playbackSpeed}
        onTogglePlay={handleTogglePlay}
        onSpeedChange={handleSpeedChange}
        position={progressState.position}
        duration={progressState.duration}
        onSeek={handleSeek}
        onSeekBy={handleSeekBy}
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
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
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
